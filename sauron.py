#!/usr/bin/env python
#
# sauron Watch for open() syscalls.
#        For Linux, uses BCC, eBPF. Embedded C.
#
#
# Copyright (c) 2023 Trin Wasinger.
#
# Based on opensnoop by (c) Brendan Gregg 2015-2022 Apache License, Version 2.0
# by Brendan Gregg, Allan McAleavy, Dina Goldshtein, Tim Douglas, Takuma Kume, and Rocky Xing

from bcc import BPF
from collections import defaultdict
import os

program_text = r'''
#include <linux/kconfig.h>
#include <uapi/linux/ptrace.h>
#include <uapi/linux/limits.h>
#include <linux/sched.h>
#include <linux/fs_struct.h>
#include <linux/dcache.h>

#define MAX_ENTRIES 32

enum event_type {
    EVENT_ENTRY,
    EVENT_END,
};

struct data_t {
    u8 valid;
    u64 id; //[pid tid]
    u64 ts;
    u32 uid;
    u32 nspid;
    int ret;
    char comm[TASK_COMM_LEN];
    enum event_type type;
    char name[NAME_MAX];
    int flags;
};

BPF_PERF_OUTPUT(events);

static struct data_t collect_data(const char __user *filename, int flags, int ret) {
    struct data_t data = {};

    u64 id = bpf_get_current_pid_tgid();
    u64 tsp = bpf_ktime_get_ns();

    struct bpf_pidns_info ns = {};
    if(bpf_get_ns_current_pid_tgid(%%DEV%%, %%INO%%, &ns, sizeof(struct bpf_pidns_info)))
    	return data;
    
    data.valid = 1;
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    bpf_probe_read_user_str(&data.name, sizeof(data.name), (void *)filename);
    data.id = id;
    data.ts = tsp / 1000;
    data.uid = bpf_get_current_uid_gid();
    data.nspid = ns.pid;
    data.flags = flags;
    data.ret = ret;

    return data;
}

#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(%%fn_open%%, struct pt_regs *regs, int ret) {
    const char __user *filename = (char *)PT_REGS_PARM1(regs);
    int flags = PT_REGS_PARM2(regs);
#else
KRETFUNC_PROBE(%%fn_open%%, const char __user *filename, int flags, int ret) {
#endif
    struct data_t data = collect_data(filename, flags, ret);

    %%SUBMIT_DATA%%

    return 0;
}

#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(%%fn_openat%%, struct pt_regs *regs, int ret) {
    int dfd = PT_REGS_PARM1(regs);
    const char __user *filename = (char *)PT_REGS_PARM2(regs);
    int flags = PT_REGS_PARM3(regs);
#else
KRETFUNC_PROBE(%%fn_openat%%, int dfd, const char __user *filename, int flags, int ret) {
#endif
    struct data_t data = collect_data(filename, flags, ret);

    %%SUBMIT_DATA%%

    return 0;
}

#ifdef OPENAT2
#include <uapi/linux/openat2.h>
#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(%%fn_openat2%%, struct pt_regs *regs, int ret) {
    int dfd = PT_REGS_PARM1(regs);
    const char __user *filename = (char *)PT_REGS_PARM2(regs);
    struct open_how __user how;
    int flags;

    bpf_probe_read_user(&how, sizeof(struct open_how), (struct open_how*)PT_REGS_PARM3(regs));
    flags = how.flags;
#else
KRETFUNC_PROBE(%%fn_openat2%%, int dfd, const char __user *filename, struct open_how __user *how, int ret) {
    int flags = how->flags;
#endif
    struct data_t data = collect_data(filename, flags, ret);

    %%SUBMIT_DATA%%

    return 0;
}
#endif
'''


devinfo = os.stat('/proc/self/ns/pid')
empty_bpf = BPF(text='')
parameters = {
    'DEV': str(devinfo.st_dev),
    'INO': str(devinfo.st_ino),
    # open and openat are always in place since 2.6.16
    'fn_open': empty_bpf.get_syscall_prefix().decode() + 'open',
    'fn_openat': empty_bpf.get_syscall_prefix().decode() + 'openat',
    'fn_openat2': empty_bpf.get_syscall_prefix().decode() + 'openat2',
    'SUBMIT_DATA': '''
    data.type = EVENT_ENTRY;
    events.perf_submit(ctx, &data, sizeof(data));

    if (data.name[0] != '/') { // Only need to expand relative paths
        struct task_struct *task;
        struct dentry *dentry;
        int i;

        task = (struct task_struct *)bpf_get_current_task_btf();
        dentry = task->fs->pwd.dentry;

        for (i = 1; i < MAX_ENTRIES; i++) {
            bpf_probe_read_kernel(&data.name, sizeof(data.name), (void *)dentry->d_name.name);
            data.type = EVENT_ENTRY;
            events.perf_submit(ctx, &data, sizeof(data));

            if (dentry == dentry->d_parent) { // At root directory
                break;
            }

            dentry = dentry->d_parent;
        }
    }

    data.type = EVENT_END;
    events.perf_submit(ctx, &data, sizeof(data));
    ''' # The compiler won't let this be a macro since it includes bcc map calls
}

for key, value in parameters.items():
    program_text = program_text.replace(f'%%{key}%%', value)

if empty_bpf.ksymname(empty_bpf.get_syscall_prefix().decode() + 'openat2') != -1:
    program_text = '#define OPENAT2\n' + program_text


# Create Program
program = BPF(text=program_text)

# Matches C event_type
class EventType(object):
    EVENT_ENTRY = 0
    EVENT_END = 1

entries = defaultdict(list)

def on_data(cpu, data, size):
    event = program["events"].event(data)
    if not event.valid:
        return

    # The system makes plenty of calls itself that are of little meaning to us
    if event.uid == 0:
        return
    # Errors are often not an issue, e.g. gcc looking in different places for a header
    if event.ret < 0:
        return

    if event.type == EventType.EVENT_END:

        # Split return value into fd and errno
        if event.ret >= 0:
            fd_s = event.ret
            err = 0
        else:
            fd_s = -1
            err = - event.ret

        print(f'''UID: {event.uid}, PID: {event.id >> 32}, TID: {event.id & 0xffffffff}, NSPID: {event.nspid}, FD: {fd_s}, ERRNO: {err}, FLAGS: {'{:08o}'.format(event.flags)}, PATH: '{os.path.join(*reversed(entries[event.id])).decode('utf-8')}' ''')

        try:
            del(entries[event.id])
        except Exception:
            pass
    elif event.type == EventType.EVENT_ENTRY:
        entries[event.id].append(event.name)

program["events"].open_perf_buffer(on_data, page_cnt=64) # The size of the perf ring buffer in number of pages (must be a power of two)
while True:
    try:
        program.perf_buffer_poll()
    except KeyboardInterrupt:
        exit()
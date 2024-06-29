#!/usr/bin/bash
//`which sjs` -r <(mtsc -po- -tes2018 -Ilib "$0" | tee index.js) "$@"; exit $?
//@ts-nocheck

// import {escape} from 'https://deno.land/std@0.224.0/regexp/escape.ts'

if('system' in globalThis) {
    globalThis['Deno'] = globalThis['system'];
} else {
    globalThis['system'] = globalThis['Deno'];
}

function kwargs(args: object) {
    return Object.entries(args).map(([k,v])=>new NamedArgument(k,v));
}

///#include "../libpython/python.ts"
const {BPF} = python.import('bcc');
const {connect} = python.runModule(`
def connect(program,callback,page_cnt=64):
    program["events"].open_perf_buffer(
        lambda cpu,data,size: callback(program["events"].event(data)),
        page_cnt=page_cnt
    );
`);

// https://www.man7.org/linux/man-pages/man7/bpf-helpers.7.html
// https://github.com/iovisor/bcc/blob/master/docs/reference_guide.md

let srcText = `
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
    if(bpf_get_ns_current_pid_tgid(PIDSTAT_DEV, PIDSTAT_INO, &ns, sizeof(struct bpf_pidns_info)))
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

static int hook(void *ctx, const char __user *filename, int flags, int ret) {
    struct data_t data = collect_data(filename, flags, ret);
    if(data.uid == 0 || data.ret < 0) return 0;

    events.perf_submit(ctx, &data, sizeof(data));

    return 0;
}

#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(%%fn_open%%, struct pt_regs *regs, int ret) {
    const char __user *filename = (char *)PT_REGS_PARM1(regs);
    int flags = PT_REGS_PARM2(regs);
#else
KRETFUNC_PROBE(%%fn_open%%, const char __user *filename, int flags, int ret) {
#endif
    
    return hook(ctx,filename,flags,ret);
}

#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(%%fn_openat%%, struct pt_regs *regs, int ret) {
    int dfd = PT_REGS_PARM1(regs);
    const char __user *filename = (char *)PT_REGS_PARM2(regs);
    int flags = PT_REGS_PARM3(regs);
#else
KRETFUNC_PROBE(%%fn_openat%%, int dfd, const char __user *filename, int flags, int ret) {
#endif

    return hook(ctx,filename,flags,ret);
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

    return hook(ctx,filename,flags,ret);
}
#endif
`;

const devinfo = await system.stat('/proc/self/ns/pid');
const emptyBPF = new BPF(...kwargs({text:''}));
const syscallPrefix = `${emptyBPF.get_syscall_prefix().decode()}`;

const parameters = {
    // open and openat are always in place since 2.6.16
    fn_open: syscallPrefix + 'open',
    fn_openat: syscallPrefix + 'openat',
    fn_openat2: syscallPrefix + 'openat2'
}

///#warning incomplete submit data

for(const [key,value] of Object.entries(parameters)) {
    srcText=srcText.replaceAll(`%%${key}%%`,value);
}

if(+(emptyBPF.ksymname(parameters.fn_openat2)) != -1) {
    program_text = '#define OPENAT2\n' + program_text;
}


system.writeTextFileSync('out.c',srcText);

const program = new BPF(...kwargs({
    text: srcText,
    cflags: [
        `-DPIDSTAT_DEV=${devinfo.dev}`,
        `-DPIDSTAT_INO=${devinfo.ino}`,

        
        // `-DFN_OPEN=${syscallPrefix}open`,
        // `-DFN_OPENAT=${syscallPrefix}openat`,
        // `-DFN_OPENAT2=${syscallPrefix}openat2`,
        // `-DPSYSCALL(NAME)=${syscallPrefix}${syscallPrefix ? '##' : ''}NAME`
    ]
}));

connect(program, new Callback(function(kwargs,event) {
    const name = `${event.name.decode()}`;
    if(name.startsWith('/proc/') || name.startsWith('/etc/') || name.startsWith('/dev/')) return;
    console.log(name)
}),64);

while(true) {
    program.perf_buffer_poll();
}

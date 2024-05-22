
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
    if(bpf_get_ns_current_pid_tgid(4, 4026532255, &ns, sizeof(struct bpf_pidns_info)))
    	return data;
    
    data.valid = 1;
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    bpf_probe_read_user_str(&data.name, sizeof(data.name), (void *)filename);
    data.id = id;
    data.ts = tsp / 1000;
    data.uid = bpf_get_current_uid_gid();
    data.nspid = ns.pid;
    data.flags = flags;
    // data.ret = ret;

    return data;
}

#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(__x64_sys_open, struct pt_regs *regs, int ret) {
    const char __user *filename = (char *)PT_REGS_PARM1(regs);
    int flags = PT_REGS_PARM2(regs);
#else
KRETFUNC_PROBE(__x64_sys_open, const char __user *filename, int flags, int ret) {
#endif
    struct data_t data = collect_data(filename, flags, ret);

    
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
    

    return 0;
}

#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(__x64_sys_openat, struct pt_regs *regs, int ret) {
    int dfd = PT_REGS_PARM1(regs);
    const char __user *filename = (char *)PT_REGS_PARM2(regs);
    int flags = PT_REGS_PARM3(regs);
#else
KRETFUNC_PROBE(__x64_sys_openat, int dfd, const char __user *filename, int flags, int ret) {
#endif
    struct data_t data = collect_data(filename, flags, ret);

    
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
    

    return 0;
}

#ifdef OPENAT2
#include <uapi/linux/openat2.h>
#if defined(CONFIG_ARCH_HAS_SYSCALL_WRAPPER) && !defined(__s390x__)
KRETFUNC_PROBE(__x64_sys_openat2, struct pt_regs *regs, int ret) {
    int dfd = PT_REGS_PARM1(regs);
    const char __user *filename = (char *)PT_REGS_PARM2(regs);
    struct open_how __user how;
    int flags;

    bpf_probe_read_user(&how, sizeof(struct open_how), (struct open_how*)PT_REGS_PARM3(regs));
    flags = how.flags;
#else
KRETFUNC_PROBE(__x64_sys_openat2, int dfd, const char __user *filename, struct open_how __user *how, int ret) {
    int flags = how->flags;
#endif
    struct data_t data = collect_data(filename, flags, ret);

    
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
    

    return 0;
}
#endif

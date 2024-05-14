#include <uapi/linux/ptrace.h>

struct data_t {
    u8 valid;
};

BPF_PERF_OUTPUT(events);

static struct data_t collect_data(const char __user *filename, int flags, int ret) {
    struct data_t data = {};
    data.valid = 1;
    return data;
}

KRETFUNC_PROBE(__x64_sys_open, const char __user *filename, int flags, int ret) {
    struct data_t data = collect_data(filename, flags, ret);

    events.perf_submit(ctx, &data, sizeof(data));

    return 0;
}
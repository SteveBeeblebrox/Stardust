from bcc import BPF
from collections import defaultdict
import os

program_text = r'''
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


'''

# Create Program
program = BPF(text=program_text)


def on_data(cpu, data, size):
    event = program["events"].event(data)
    print(event.valid)


program["events"].open_perf_buffer(on_data, page_cnt=64)
while True:
    try:
        program.perf_buffer_poll()
    except KeyboardInterrupt:
        exit()
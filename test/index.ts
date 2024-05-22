#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee index.js) "$@"; exit $?
//@ts-nocheck

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
const program = new BPF(...kwargs({text: `
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
    data.valid = 1;
    return data;
}

KRETFUNC_PROBE(__x64_sys_open, const char __user *filename, int flags, int ret) {
    struct data_t data = collect_data(filename, flags, ret);
    
    events.perf_submit(ctx, &data, sizeof(data));

    bpf_trace_printk("Hello");

    return 0;
}
`}));

const {connect} = python.runModule(`
def connect(program,callback,page_cnt=64):
    program["events"].open_perf_buffer(
        lambda cpu,data,size: callback(program["events"].event(data)),
        page_cnt=page_cnt
    );
`);

connect(program, new Callback(function(kwargs,event) {
    console.log(event.valid)
}),64)

while(true) {
    program.perf_buffer_poll();
}
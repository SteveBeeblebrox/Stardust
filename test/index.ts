#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee index.js) "$@"; exit $?
//@ts-nocheck


// import { pip } from "https://deno.land/x/python/ext/pip.ts";

if('system' in globalThis) {
    globalThis['Deno'] = globalThis['system'];
} else {
    globalThis['system'] = globalThis['Deno'];
}

function kwargs(args: object) {
    return Object.entries(args).map(([k,v])=>new NamedArgument(k,v));
}

// console.log(await system.lstat('/usr/lib/x86_64-linux-gnu/libpython3.10.so.1.0'))
// for await (const entry of system.readDir('/usr/lib/x86_64-linux-gnu/')) {
//     if((entry.name as string).includes('py')) console.log(entry)
// }


///#include "../libpython/python.ts"

console.log(python)
const {BPF} = python.import('bcc');
const program = new BPF(...kwargs({text: `
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

    bpf_trace_printk("Hello");

    return 0;
}
`}));

// function callback(...args: any) {
//     console.log(args)
// }


// console.log(program['events'])
// console.log(program['events'])
// console.log(program['events'])//.open_perf_buffer(callback,...kwargs({page_cnt:64}));

// while(true) {
//     program.perf_buffer_poll();
// }

// // import { python, NamedArgument } from "https://deno.land/x/python/mod.ts";


const {pyget} = python.runModule(`
def pyget(obj,key):
    return obj[key];
`);

const {getEvent} = python.runModule(`
def getEvent(program,data):
    event = program["events"].event(data);
    print(event.valid)
`);

pyget(program,'events').open_perf_buffer(new Callback(function(_,cpu,data,size) {
    console.log(getEvent(program,data))
}),...kwargs({page_cnt:64}));

while(true) {
    program.perf_buffer_poll()
}
// console.log(doit(program))

// console.log(python.builtins.getattr(program,PyObject.from('[events]').toSlice()))
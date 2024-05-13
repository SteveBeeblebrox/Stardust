"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const ps_node_1 = require("ps-node");
const util_1 = require("util");
(async function () {
    const file = 'file.txt';
    const pids = await _switch(process.platform, {
        async win32() {
            // fuser only works on linux, there is a windows alternative though (handle.exe from SysInternals)
            throw new Error('fuser alt NYI');
        },
        async default() {
            return (await (0, util_1.promisify)(child_process_1.exec)(`fuser -a '${file}'`)).stdout.trim().split(' ');
        }
    })();
    const processes = (await Promise.all(pids.map(pid => (0, util_1.promisify)(ps_node_1.lookup)({ pid: +pid })))).map(process => process[0]);
    console.log(processes);
    // for(const pid of pids) {
    //     let process = [...await (promisify(lookup)({pid: +pid}))][0]
    //     console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
    // }
})();
function _switch(key, mapping) {
    return mapping[key] ?? mapping['default'];
}
// lsof -p PID shows snapshot of files used by pid (linux only)
// strace -f -t -e trace=file -p PID shows in real time (linux only)
// opensnoop requires kernel headers and sudo

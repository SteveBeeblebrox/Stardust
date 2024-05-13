import {exec} from 'child_process';
import {lookup} from 'ps-node';

import { promisify } from 'util'

(async function() {
    const file = 'file.txt';

    const pids: string[] = await _switch<()=>Promise<string[]>>(process.platform, {
        async win32() {
            // fuser only works on linux, there is a windows alternative though (handle.exe from SysInternals)
            throw new Error('fuser alt NYI')
        },
        async default() {
            return (await promisify(exec)(`fuser -a '${file}'`)).stdout.trim().split(' ');
        }
    })();

    const processes = (await Promise.all(pids.map(pid => promisify(lookup)({pid: +pid})))).map(process => process[0]);

    console.log(processes)
    // for(const pid of pids) {
    //     let process = [...await (promisify(lookup)({pid: +pid}))][0]
    //     console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
    // }
})()

function _switch<T>(key: string | 'default', mapping: { default: T, [key: string]: T }): T {
    return mapping[key] ?? mapping['default'];
}

// lsof -p PID shows snapshot of files used by pid (linux only)
// strace -f -t -e trace=file -p PID shows in real time (linux only)
// opensnoop requires kernel headers and sudo
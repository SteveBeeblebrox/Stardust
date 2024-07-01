#!/usr/bin/bash
//`which sjs` -DDeno=system --remote "$0" "$@"; exit $?;
// @ts-nocheck
///#pragma once

declare var system: typeof Deno;

import { Colors } from "./deps.ts";
import * as Util from "./util.ts";

// const parsedArgs = Util.parseArgs(system.args.slice(1), {
//     version: {alias: 'v', default:false, type:'boolean'},
//     help: {alias: 'h', default:false, type:'boolean'},
//     debug: {alias: 'd', default:false, type:'boolean'},
// });

Util.setSigIntHandler(function() {
    if(confirm('Are you sure you want to exit?')) {
        system.exit();
    }
});

console.log(`${Colors.bold('Stardust Alpha')}`);
console.log(`(c) 2024 Trin Wasinger`);

while(true) {
    const [command = '', message] = Util.prompt(Colors.bold(Colors.blue('>')))?.match(/^\s*(\S+?)(?:(?:(?<=[%$])| )(.*))?$/)?.slice(1)??[];

    if(command.startsWith('#')) continue;

    switch(command) {
        case '': {
            continue;
        }

        case '?':
        case 'help': {
            console.log(`Available commands:`);
            console.log(`\thelp\t\tDisplays help information`);
            console.log(`\techo ...\tPrints the given message to the console`);
            console.log(`\tclear\t\tClears the console`);
            console.log(`\texit\t\tCloses Stardust`);
            console.log(`\t$ ...\t\tRuns the given shell command`);
            console.log(`\t% ...\t\tRuns the given JavaScript`);

            continue;
        }

        case 'echo': {
            console.log(message?.trim()??'');
            continue;
        }

        case 'clear': {
            console.clear();
            continue;
        }

        case 'exit': {
            system.exit();
        }

        case '$': {
            await new system.Command('/usr/bin/bash', {args: ['-c',message]}).spawn().status;
            continue;
        }

        case '%': {
            try {
                console.log(await (0,eval)(message));
            } catch (error) {
                Util.error(error, 'JavaScript Error');
            }
            continue;
        }

        default: {
            Util.error(`Unknown command '${command}'. Perhaps you meant '$${command}'?`);
            continue;
        }
    }
}

/**/
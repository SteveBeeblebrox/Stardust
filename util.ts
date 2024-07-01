declare var system;
import { Cli, Colors } from "./deps.ts";

export function parseArgs(args: string[], options: {[key: string]: Partial<{alias: string, type: 'boolean' | 'string' | 'collect', default: string | boolean | string[]}>}): Record<string, string | boolean | string[]> {
    return Cli.parseArgs(args, Object.entries(options).reduce(function(config,[arg,options]) {
        if(options.alias !== undefined) config.alias[arg] = options.alias;
        if(options.default !== undefined) config.default[arg] = options.default;
        if(options.type !== undefined) config[options.type].push(arg);
        return config;
    }, {
        alias: {} as Record<string,string>,
        boolean: new Array<string>(),
        string: new Array<string>(),
        collect: new Array<string>(),
        default: {} as Record<string,string | boolean | string[]>
    }));
}

let sigIntHandler: null | (()=>void) = null;
export function setSigIntHandler(handler: ()=>void) {
    system.addSignalListener('SIGINT', sigIntHandler=handler);
}
export function removeSigIntHandler() {
    system.remoteSignalListener('SIGINT', sigIntHandler);
    sigIntHandler = null;
}

// like globalThis.prompt() but allows for sigint handler to triggered if set using the above methods
export function prompt(message: string) {
    return globalThis.prompt(message) ?? (function() {
        if(sigIntHandler !== null) {
            system.removeSignalListener('SIGINT', sigIntHandler);
            sigIntHandler()
            system.addSignalListener('SIGINT', sigIntHandler);
        }
        return null;
    })();
}

export function error(error: any, prefix: string = 'Error') {
    console.error(`${Colors.red(prefix+':')}`, error);
}

export function warn(warning: any, prefix: string = 'Warning') {
    console.error(`${Colors.yellow(prefix+':')}`, warning);
}

export class Version {
    constructor(
        public readonly major: number = 1,
        public readonly minor: number = 0,
        public readonly patch: number = 0,
        public readonly prerelease?: string,
        public readonly metadata?: string
    ) {}

    public override toString(): string {
        return `v${this.major}.${this.minor}.${this.patch}${this.prerelease !== undefined ? `-${this.prerelease}` : ''}${this.metadata !== undefined ? `+${this.metadata}` : ''}`;
    }
}
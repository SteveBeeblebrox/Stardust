#!/usr/local/bin/sjs -r
//@ts-check
const url = ;
console.log(`Routing ${url}`);




class HttpError extends Error {
    static readonly ERROR_TEXT = Object.freeze(Object.assign(Object.create(null), {
        404: 'Not found'
    }));
    constructor(public readonly code: number, message?: string, cause?: Error) {
        super(message ?? HttpError.ERROR_TEXT[code], {cause});
    }
}

// system.serve({onListen: ()=>{}, port: 8180}, async function() {
//     return new Response('hello world');
// });

function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]-/g, '\\$&');
}

class Handler {
    public readonly isFile: boolean;
    public readonly isDirectory: boolean;

    public readonly path: string;
    public readonly name: string;

    public readonly pattern: RegExp;

    constructor(entry: DirEntry) {
        this.isFile = entry.isFile;
        this.isDirectory = entry.isDirectory;
        this.path = `${entry.parentPath}/${entry.name}`;
    
        this.name = entry.name;

        const stem = Handler.stem(this.isDynamic ? this.name.slice(1) : this.name);
        this.pattern = new RegExp(`^${stem.replace(/\[(?<modifier>)?(?<parameter>[a-zA-Z_][a-zA-Z0-9_]*)\]|(?<char>[\s\S])/g, function(match, ...args) {
            const {modifier,char,parameter} = args.at(-1);
            if(char !== undefined) return escapeRegex(char);
            else return String.raw`(?<${parameter}>[\s\S]+)`;
        })}$`);
    }

    [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    static ext(name: string): string | null {
        return name.startsWith('.') || !name.includes('.') ? null : name.split('.').pop() ?? null;
    }

    static stem(name: string): string {
        const ext = Handler.ext(name);
        return ext ? name.slice(0,-ext.length-1) : name;
    }

    get isDynamic() {
        return this.name.startsWith('#');
    }

    get ext() {
        return Handler.ext(this.name);
    }

    match(part: string, tail: string[]) {
        let ext = Handler.ext(part);
        return (ext === this.ext || ((!tail.length && ext === null && ((this.ext === 'html') || (this.isDynamic && (this.ext === 'js' || this.ext === 'ts'))))))
            && Handler.stem(part).match(this.pattern) || null;
    }

    async invoke(request: Request, args: Map<string,string>): Response {
        if(this.isDynamic)


        console.log(this.path, args);
    }
}

console.log(await handleRequest(new Request(url)));

/**
 * 
 * [param]
 * #name
 * extensions are optional for .html and #xyz.js
 */
async function handleRequest(request: Request, root: string = './www'): Response {
    const route = new URL(request.url).pathname.split('/').filter(x=>x);

    const args = new Map<string,string>();

    let dir = root, part;
    while(part = route.shift()) {
        for await(const entry of system.readDir(new URL(import.meta.resolve(dir)).pathname)) {
            if(entry.name.startsWith('.') || entry.name.startsWith('_') || entry.isSymlink) continue;
            
            const handler = new Handler(entry);
            
            let matches;
            if(matches = handler.match(part, route)) {
                for(const [key,value] of Object.entries(matches.groups)) {
                    args.set(key,value);
                }

                if(handler.isFile) {
                    return await handler.invoke(request, args);
                } else if(handler.isDirectory) {
                    dir += '/' + handler.name;
                    break;
                }
            }
        }
    }

    throw new HttpError(404);
}
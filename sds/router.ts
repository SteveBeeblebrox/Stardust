#!/usr/local/bin/sjs -r

class HttpError extends Error {
    static readonly ERROR_TEXT = Object.freeze(Object.assign(Object.create(null), {
        404: 'Not found'
    }));
    constructor(public readonly code: number, message?: string, cause?: Error) {
        super(message ?? HttpError.ERROR_TEXT[code], {cause});
    }
}

function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]-/g, '\\$&');
}

/*

abstract class RouteHandler {



}

class Router extends RouteHandler {
    constructor(private readonly routes: RouteHandler[]) {

    }

    static async new(root: string = './www'): Router {
        const routes = new Array<RouteHandler>();
        for await(const entry of system.readDir(Router.resolve(root))) {
            if(entry.name.startsWith('.') || entry.name.startsWith('_') || entry.isSymlink) continue;
            
            if(entry.isFile) {

            } else {
                
            }
        }
    }
}



class RouteHandler {

}*/
import { contentType } from "https://deno.land/std@0.224.0/media_types/content_type.ts";


abstract class RouteNode {
    public abstract matches(current: string, rest: string[]): null | [string,string][];
}

abstract class RouteHandler extends RouteNode {
    static readonly PATH_SEPARATOR = '/';

    constructor(protected readonly path: string) {}

    public abstract async get(request: Request): Promise<Response>;

    static ext(name: string): string | null {
        if(name.includes(RouteHandler.PATH_SEPARATOR)) return RouteHandler.ext(name.split(RouteHandler.PATH_SEPARATOR).at(-1));
        return name.startsWith('.') || !name.includes('.') ? null : name.split('.').pop() ?? null;
    }

    static stem(name: string): string {
        if(name.includes(RouteHandler.PATH_SEPARATOR)) return RouteHandler.stem(name.split(RouteHandler.PATH_SEPARATOR).at(-1));
        const ext = RouteHandler.ext(name);
        return ext ? name.slice(0,-ext.length-1) : name;
    }

    static resolve(path: string) {
        return new URL(import.meta.resolve(path)).pathname;
    }
}

class StaticFileHandler extends RouteHandler {
    public async override get(_: Request): Promise<Response> {
        return new Response(system.readTextFile(RouteHandler.resolve(this.path)), {headers: {'Content-Type': contentType(RouteHandler.ext(this.path))}});
    }
}

class DynamicJavaScriptHandler extends RouteHandler {
    private module: object;
    public async override get(request: Request): Promise<Response> {
        this.module ??= await import(this.path);
        return (this.module[request.method] ?? this.module['ANY'])(request);
    }
}

function template(text: string, request: Request): string {
    return eval(text);
}

class DynamicTemplateHandler extends RouteHandler {
    public async override get(request: Request): Promise<Response> {
        const text = (await system.readTextFile(RouteHandler.resolve(this.path))).replaceAll(/%%(?<script>[\s\S]*?)%%/g, function(...args) {
            return template(args.at(-1).script, request);
        });

        return new Response(text, {headers: {'Content-Type': contentType(RouteHandler.ext(this.path))}});
    }
}

class Router extends RouteNode {
    public handle(request: Request): Response {
        const route = new URL(request.url).pathname.split(RouteNode.PATH_SEPARATOR).filter(x=>x);

    }
    public override matches(current: string, rest: string[]): : null | [string,string][] {

    }
}

// const url = new URL('https://example.com' + system.args.at(1));
// console.log(`Routing ${url}`);
// const router = Router.new();

// console.log(contentType('html'))
// console.log(new StaticFileHandler('./www/text.html').get())

const request = new Request('https://example.com');
request.args ??= {a:1}

// console.log(await new DynamicJavaScriptHandler('./www/x.js').get(request))

console.log(await (await new DynamicTemplateHandler('./www/text.html').get(request)).text())
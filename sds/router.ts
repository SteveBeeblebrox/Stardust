#!/usr/local/bin/sjs -r

/// <reference lib="esnext"/>
/// <reference lib="webworker"/>

declare var system;

class HttpError extends Error {
    static readonly ERROR_TEXT = Object.freeze(Object.assign(Object.create(null), {
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Payload Too Large',
        414: 'URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Range Not Satisfiable',
        417: 'Expectation Failed',
        418: 'I\'m a teapot',
        421: 'Misdirected Request',
        422: 'Unprocessable Content',
        423: 'Locked',
        424: 'Failed Dependency',
        425: 'Too Early',
        426: 'Upgrade Required',
        428: 'Precondition Required',
        429: 'Too Many Requests',
        431: 'Request Header Fields Too Large',
        451: 'Unavailable For Legal Reasons',

        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
        506: 'Variant Also Negotiates',
        507: 'Insufficient Storage',
        508: 'Loop Detected',
        510: 'Not Extended',
        511: 'Network Authentication Required',
    }));

    public readonly headers?: HeadersInit;

    constructor(public readonly code: number, {cause, headers}: {cause?: Error, headers?: HeadersInit} = {}, message: string = HttpError.ERROR_TEXT[code]) {
        super(message, {cause});
        this.name = this[Symbol.toStringTag]();
        this.headers = headers;
    }
    [Symbol.toStringTag]() {
        return `${this.constructor.name} ${this.code}`;
    }
}

function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]-/g, '\\$&');
}

function throws(error: any): never {
    throw error;
}

import { contentType } from "https://deno.land/std@0.224.0/media_types/content_type.ts";
import * as path from 'https://deno.land/std@0.102.0/path/mod.ts';

abstract class RouteNode {
    protected static readonly PATH_SEPARATOR = '/';

    private readonly pattern: RegExp;
    
    constructor(stem: string) {
        this.pattern = new RegExp(`^${stem.replace(/\[(?<modifier>)?(?<parameter>[a-zA-Z_][a-zA-Z0-9_]*)\]|(?<char>[\s\S])/g, function(...args) {
            const {modifier,char,parameter} = args.at(-1);
            if(char !== undefined) return escapeRegex(char);
            else return String.raw`(?<${parameter}>[\s\S]+)`;
        })}$`);
    }
    
    protected abstract get(request: Request, current: string, ...rest: string[]): MaybePromise<Response | null>;

    protected nmatch(request: Request, name: string): boolean {
        let matches;
        return !!(
            (matches = RouteNode.stem(name)?.match(this.pattern))
            && Object.assign(request.args??=Object.create(null),matches.groups)
        );
    }

    [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    static ext(name: string | null): string | null {
        if(!name) return null;
        if(name.includes(RouteNode.PATH_SEPARATOR)) return RouteNode.ext(RouteNode.basename(name));
        return name.startsWith('.') || !name.includes('.') ? null : name.split('.').pop() ?? null;
    }

    static stem(name: string | null): string | null {
        if(!name) return null;
        if(name.includes(RouteNode.PATH_SEPARATOR)) return RouteNode.stem(RouteNode.basename(name));
        const ext = RouteNode.ext(name);
        return ext ? name.slice(0,-ext.length-1) : name;
    }

    static basename(name: string | null): string | null {
        return name?.split(RouteNode.PATH_SEPARATOR).at(-1) ?? null;
    }

    static concat(...names: string[]) {
        return names.join(RouteNode.PATH_SEPARATOR);
    }

    static split(name: string) {
        return name.split(RouteNode.PATH_SEPARATOR).filter(x=>x);
    }

    static resolve(name: string) {
        return path.resolve(new URL(import.meta.url).pathname, '..', name);
    }
}

type MaybePromise<T> = Promise<T> | T;

declare global {
    export interface Request {
        args?: object;
    }
}

abstract class RouteHandler extends RouteNode {
    constructor(protected readonly path: string, stem: string = RouteNode.stem(path) ?? throws(new Error(`Path '${path}' does not name a file`))) {
        super(stem);
    }

    public abstract response(request: Request): MaybePromise<Response>;

    public get optionalExtensions(): string[] {
        return ['html'];
    }

    protected override get(request: Request, current: string, ...rest: string[]): MaybePromise<Response | null> {
        return (
            !rest.length
        ) && (
            RouteNode.ext(current) === RouteNode.ext(this.path)
            || (
                RouteNode.ext(current) === null
                && this.optionalExtensions.includes(RouteNode.ext(this.path) as string)
            )
        ) && (
            this.nmatch(request, current)
        ) ? this.response(request) : null;
    }
}

abstract class StaticRouteHandler extends RouteHandler {
    constructor(path: string) {
        super(path);
    }
    public abstract response(): MaybePromise<Response>;
}

abstract class DynamicRouteHandler extends RouteHandler {
    constructor(path: string) {
        super(path, RouteNode.stem(path)?.replace(/^#/,'') ?? throws(new Error(`Path '${path}' does not name a file`)));
    }
}

class StaticFileHandler extends StaticRouteHandler {
    public override async response(): Promise<Response> {
        return new Response(await system.readTextFile(RouteNode.resolve(this.path)), {headers: {'Content-Type': contentType(RouteHandler.ext(this.path))}});
    }
}

class DynamicJavaScriptHandler extends DynamicRouteHandler {
    private module: object;
    public override async response(request: Request): Promise<Response> {
        this.module ??= await import(this.path.replaceAll(/#/g, '%23'));
        return (this.module[request.method] ?? this.module['ANY'] ?? throws(new HttpError(405, {headers: {'Allow': Object.keys(this.module).join(', ')}})))(request) ?? throws(new HttpError(404));
    }

    public override get optionalExtensions(): string[] {
        return ['js','mjs','ts','mts'];
    }
}

function template(text: string, request: Request): string {
    return eval(text);
}

class DynamicTemplateHandler extends DynamicRouteHandler {
    public override async response(request: Request): Promise<Response> {
        const text = (await system.readTextFile(RouteNode.resolve(this.path))).replaceAll(/%%(?<script>[\s\S]*?)%%/g, function(...args) {
            return template(args.at(-1).script, request);
        });

        return new Response(text, {headers: {'Content-Type': contentType(RouteNode.ext(this.path))}});
    }
}

class Router extends RouteNode {
    private constructor(private readonly root: string, private readonly nodes: Array<RouteNode> = new Array()) {
        super(root);
    }

    public async handle(request: Request): Promise<Response> {
        try {
            const route = RouteNode.split(new URL(request.url).pathname);
            return (await this.get(request, this.root, ...route)) ?? throws(new HttpError(404));
        } catch(error) {
            if(!(error instanceof HttpError)) {
                // console.error(error);
                throw new HttpError(500, {cause: error})
            } else {
                throw error;
            }
        }
    }

    protected override async get(request: Request, current: string, ...rest: string[]): Promise<Response | null> {
        if(this.nmatch(request,current)) {
            for(const node of this.nodes) {
                let response = await (node as this).get(request, ...(rest as [string,...string[]]));
                if(response !== null) {
                    return response;
                }
            }
        }

        return null;
    }
    
    // TODO .p.* dynamic files, index.* files, error files
    public static async new(root: string = './www'): Promise<Router> {
        const handlers: RouteHandler[] = [], routers: Router[] = [],
            templateHandlers: RouteHandler[] = [], templateRouters: Router[] = []
        ;

        for await(const entry of system.readDir(Router.resolve(root))) {
            if(entry.name.startsWith('.') || entry.name.startsWith('_') || entry.isSymlink) continue;
            
            const path = RouteNode.concat(root, entry.name);

            const isTemplated = /\[(?<modifier>)?(?<parameter>[a-zA-Z_][a-zA-Z0-9_]*)\]/g.test(entry.name);

            if(entry.isFile) {
                const isDynamic = RouteNode.basename(entry.name)?.startsWith('#') || false;

                if(isDynamic) {
                    switch(RouteNode.ext(entry.name)) {
                        case 'js':
                        case 'ts':
                        case 'mjs':
                        case 'mts':
                            (isTemplated ? templateHandlers : handlers).push(new DynamicJavaScriptHandler(path));
                            break;
                        default:
                            (isTemplated ? templateHandlers : handlers).push(new DynamicTemplateHandler(path));
                    }
                } else {
                    (isTemplated ? templateHandlers : handlers).push(new StaticFileHandler(path));
                }
            } else {
                (isTemplated ? templateRouters : routers).push(await Router.new(path));
            }
        }

        // Order by x, x/, [x], [x]/
        return new Router(RouteNode.basename(root) ?? throws(new Error(`Path '${root}' does not name a directory`)), [...handlers, ...routers, ...templateHandlers, ...templateRouters]);
    }
}

// const url = new URL('https://example.com' + system.args.at(1));
// console.log(`Routing ${url}`);
// const router = Router.new();

// console.log(contentType('html'))
// console.log(new StaticFileHandler('./www/text.html').get())

const request = new Request(new URL('https://example.com/' + system.args.at(1)));

// console.log(await new DynamicJavaScriptHandler('./www/x.js').get(request))

//console.log(await (await new DynamicTemplateHandler('./www/text.html').response(request)).text())

const router = await Router.new();

// console.log(path.resolve(new URL(import.meta.url).pathname, '..', './www/#[n].html'))


console.log(await (await router.handle(request)).text())
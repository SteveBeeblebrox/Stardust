declare var system: typeof Deno;
import 'data:text/javascript,globalThis["Deno"]??=globalThis["system"]';
export * as Colors from 'https://deno.land/std/fmt/colors.ts';
export * as Cli from 'https://deno.land/std@0.224.0/cli/mod.ts';
export * as sqlite3 from 'https://deno.land/x/sqlite3@0.11.1/mod.ts';
export { python } from 'https://deno.land/x/python/mod.ts';
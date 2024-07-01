
declare var system: typeof Deno;

import { Colors, SQLite3 } from "./deps.ts";
const { Database } = SQLite3;
import * as Util from "./util.ts";
import {Version} from "./util.ts";

export const VERSION = new Version(0,0,1);

// const parsedArgs = Util.parseArgs(system.args.slice(1), {
//     version: {alias: 'v', default:false, type:'boolean'},
//     help: {alias: 'h', default:false, type:'boolean'},
//     debug: {alias: 'd', default:false, type:'boolean'},
// });

if(
    import.meta.main && (typeof DedicatedWorkerGlobalScope === 'undefined' || !(self instanceof DedicatedWorkerGlobalScope))
) {
    console.log(Colors.bold(`SDB ${VERSION} (c) 2024 Trin Wasinger`));

    const db = new Database("stardust.db");

    const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
    console.log(version);

    db.close();
} else {

}
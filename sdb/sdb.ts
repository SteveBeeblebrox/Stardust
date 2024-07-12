#!/usr/bin/bash
//`which sjs` --remote "$0" "$@"; exit $?;
///#pragma once

import { Colors, sqlite3 } from "../deps.ts";
const { Database } = sqlite3;
sqlite3.Database.prototype[Symbol.dispose] ??= sqlite3.Database.prototype.close;

import * as Util from "../util.ts";
import {Version} from "../util.ts";

export const VERSION = new Version(0,0,1);

// const parsedArgs = Util.parseArgs(system.args.slice(1), {
//     version: {alias: 'v', default:false, type:'boolean'},
//     help: {alias: 'h', default:false, type:'boolean'},
//     debug: {alias: 'd', default:false, type:'boolean'},
// });

// if(
//     import.meta.main && (typeof DedicatedWorkerGlobalScope === 'undefined' || !(self instanceof DedicatedWorkerGlobalScope))
// ) {
    console.log(Colors.bold(`SDB ${VERSION} (c) 2024 Trin Wasinger`));

    using db = new Database(new URL(import.meta.resolve('./sdb.db')).pathname);
    db.exec(await system.readTextFile(new URL(import.meta.resolve('./sdb.sql')).pathname));

    const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
    console.log(version);


// } else {

// }
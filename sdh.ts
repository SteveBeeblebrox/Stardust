#!/usr/local/bin/sjs -r
import * as Util from './util.ts'

const args = Util.parseArgs(system.args.slice(1), {
    version: {alias: 'v', default: false, type: 'boolean'},
    help: {alias: 'h', default: false, type: 'boolean'},
    debug: {alias: 'd', default: false, type: 'boolean'},
});
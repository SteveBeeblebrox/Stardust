import express from 'express';
import {createServer} from 'http';


// The minifier doesn't like top level await, so make it look like a function call
declare function _await<T>(promise: Promise<T>): T
///#define _await(promise) (o=>o||o)(await(promise))

_await(import('dotenv-expand')).expand(_await(import('dotenv')).config());

const env = process.env;
const app = express();
const server = createServer(app);

///#include "terminal.mts"

app.use(express.static('src/public'));
app.use('/scripts', express.static('node_modules/'));

server.listen(env.PORT,()=>console.log(`Running on localhost:${env.PORT}`));
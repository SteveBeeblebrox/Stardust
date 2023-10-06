import express from 'express';
import {createServer} from 'http';
import {WebSocketServer, WebSocket} from 'ws';
import pty from 'node-pty'

const port = 3000;
const app = express();
const server = createServer(app);

var wss = new WebSocketServer({server: server, path: "/term"});

wss.on('connection', function(ws, request, client) {
    const shell = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30
    });

    shell.onData(function(data) {
        ws.send(data);
    });

    shell.onExit(function() {
        ws.close();
    });

    ws.on('error', console.error);

    ws.on('message', function(data) {
        let match;
        if(match = data.toString().match(/^%(?<arg>r)\s*(?<rows>\d+)\s*,\s*(?<cols>\d+)$/)) {
            shell.resize(+match.groups.rows,+match.groups.cols);
        } else {
            shell.write(data);
        }
    });
});

app.use(express.static('public'))
app.use('/scripts', express.static('node_modules/'));

server.listen(port,()=>console.log(`Running on localhost:${port}`));
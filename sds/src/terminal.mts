import {WebSocketServer, WebSocket} from 'ws';
import pty from 'node-pty'

declare const server;
const wss = new WebSocketServer({server, path: '/connect-terminal'});

wss.on('connection', function(socket: WebSocket, request, client) {
    const shell = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30
    });

    shell.onData(function(data) {
        socket.send(data);
    });

    shell.onExit(function() {
        socket.close();
    });

    socket.on('error', console.error);

    socket.on('message', function(data) {
        let match;
        if(match = data.toString().match(/^%(?<arg>r)\s*(?<rows>\d+)\s*,\s*(?<cols>\d+)$/)) {
            shell.resize(+match.groups.rows,+match.groups.cols);
        } else {
            shell.write(data);
        }
    });
});
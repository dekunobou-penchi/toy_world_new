import { WebSocketServer, type WebSocket } from 'ws';
import type { Server } from 'node:http';
import { handleMessage } from './handlers.js';



export function setupWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    // 接続ログ
    console.log("Client has connected");

    ws.on('message', (data) => {
      handleMessage(ws, data);
    });


    ws.on('close', () => {
      // 切断ログ
      console.log('Disconnected');
    });
  });

  return wss;
}
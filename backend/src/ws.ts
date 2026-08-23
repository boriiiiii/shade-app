import type { Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { bus } from './bus.js';
import { getState, getOrders } from './state.js';
import { recentLogs } from './logger.js';
import type { WsMessage } from './types.js';

/**
 * Attache un serveur WebSocket au serveur HTTP existant (chemin /ws).
 * Chaque client reçoit d'abord un "hello" (état + logs récents) puis le flux
 * temps réel (logs, état, trades) rediffusé depuis le bus interne.
 */
export function attachWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  const send = (ws: WebSocket, msg: WsMessage) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  };

  wss.on('connection', (ws) => {
    send(ws, {
      type: 'hello',
      payload: { state: getState(), recentLogs: recentLogs(), orders: getOrders() },
    });

    const unsub = bus.onMessage((msg) => send(ws, msg));

    ws.on('close', unsub);
    ws.on('error', unsub);
  });

  // Keepalive : ping toutes les 30s pour détecter les connexions mortes.
  const interval = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }
  }, 30_000);
  wss.on('close', () => clearInterval(interval));

  return wss;
}

import { EventEmitter } from 'node:events';
import type { WsMessage } from './types.js';

/**
 * Bus d'événements interne. Tout ce qui doit remonter au frontend
 * (logs, changements d'état, trades) est émis ici ; le serveur WebSocket
 * s'y abonne et rediffuse aux clients connectés.
 */
class Bus extends EventEmitter {
  emitMessage(msg: WsMessage) {
    this.emit('message', msg);
  }
  onMessage(fn: (msg: WsMessage) => void) {
    this.on('message', fn);
    return () => this.off('message', fn);
  }
}

export const bus = new Bus();
bus.setMaxListeners(100);

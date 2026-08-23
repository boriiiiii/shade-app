import { useCallback, useEffect, useRef, useState } from 'react';
import { WS_URL } from './config';
import type { BotState, LogEntry, Order, WsMessage } from './types';

const MAX_LOGS = 500;

/**
 * Gère la connexion WebSocket au backend et expose le flux temps réel
 * (logs, état, ordres). `pushLocal` permet d'injecter des lignes locales.
 */
export function useBotSocket() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [state, setState] = useState<BotState | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appendLogs = useCallback((entries: LogEntry[]) => {
    setLogs((prev) => {
      const next = [...prev, ...entries];
      return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
    });
  }, []);

  const pushLocal = useCallback(
    (level: LogEntry['level'], message: string, source = 'you') => {
      appendLogs([{ id: `local-${Date.now()}-${Math.random()}`, ts: Date.now(), level, source, message }]);
    },
    [appendLogs],
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  const upsertOrder = useCallback((o: Order) => {
    setOrders((prev) => {
      const i = prev.findIndex((x) => x.id === o.id);
      if (i === -1) return [o, ...prev].slice(0, 100);
      const copy = [...prev];
      copy[i] = o;
      return copy;
    });
  }, []);

  useEffect(() => {
    let closed = false;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retryRef.current = setTimeout(connect, 2000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (ev) => {
        let msg: WsMessage;
        try {
          msg = JSON.parse(ev.data as string);
        } catch {
          return;
        }
        switch (msg.type) {
          case 'hello':
            setState(msg.payload.state);
            setOrders(msg.payload.orders);
            setLogs((prev) => {
              const locals = prev.filter((l) => l.id.startsWith('local-'));
              return [...locals, ...msg.payload.recentLogs].slice(-MAX_LOGS);
            });
            break;
          case 'log':
            appendLogs([msg.payload]);
            break;
          case 'state':
            setState(msg.payload);
            break;
          case 'order':
            upsertOrder(msg.payload);
            break;
        }
      };
    };

    connect();
    return () => {
      closed = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [appendLogs, upsertOrder]);

  return { logs, state, orders, connected, pushLocal, clearLogs };
}

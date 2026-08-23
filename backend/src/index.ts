import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { api } from './routes.js';
import { attachWebSocket } from './ws.js';
import { logger } from './logger.js';
import { feeder } from './engines/feeder.js';

const app = express();
app.use(cors({ origin: config.corsOrigins === '*' ? true : config.corsOrigins.split(',') }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, network: config.network }));
app.use('/api', api);

const server = http.createServer(app);
attachWebSocket(server);

server.listen(config.port, () => {
  logger.sys('sys', '════════════════════════════════════════════════════════');
  logger.sys('sys', `  SHADE backend listening on http://localhost:${config.port}`);
  logger.sys('sys', `  Realtime WebSocket   : ws://localhost:${config.port}/ws`);
  logger.sys('sys', `  Solana network       : ${config.network}`);
  logger.sys('sys', `  RPC                  : ${config.rpcUrl.replace(/api-key=[^&]+/, 'api-key=***')}`);
  logger.sys('sys', `  Mode                 : non-custodial (each tx signed in Phantom)`);
  logger.sys('sys', `  Max trade / slippage : ${config.trading.maxTradeSol} SOL / ${config.trading.maxSlippageBps} bps`);
  logger.sys('sys', '════════════════════════════════════════════════════════');

  if (config.demo.feed) feeder.start();
});

process.on('SIGINT', () => {
  logger.sys('sys', 'shutting down…');
  server.close(() => process.exit(0));
});

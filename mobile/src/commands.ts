import { api } from './api';
import type { LogLevel } from './types';

export interface CommandContext {
  log: (level: LogLevel, message: string) => void;
  clear: () => void;
  connectPhantom: () => Promise<void>;
}

const HELP: string[] = [
  'AVAILABLE COMMANDS',
  '  help                       this help',
  '  clear                      clear the terminal',
  '  status                     bot status (engines, wallet, stats)',
  '',
  ' WALLET (non-custodial — you sign every tx in Phantom)',
  '  connect                    connect Phantom (deep link)',
  '  connect <address>          dev connect (paste an address)',
  '  disconnect                 disconnect wallet',
  '',
  ' COPYTRADE',
  '  copy start | stop          start / stop the engine',
  '  copy add <address>         watch a target address',
  '  copy rm <address>          remove a target',
  '  copy list                  list targets',
  '  copy mode fixed|proportional',
  '  copy amount <sol>          fixed amount copied / trade',
  '  copy pct <n>               % of target amount (proportional mode)',
  '',
  ' SNIPING',
  '  snipe start | stop         start / stop the engine',
  '  snipe amount <sol>         amount per snipe',
  '  snipe slippage <bps>       slippage (basis points)',
  '  snipe delay <ms>           max delay after detection',
  '',
  ' ORDERS (approve & sign each one in the ORDERS tab)',
  '  buy <mint> [sol]           queue a manual buy order',
  '  orders                     latest orders',
  '',
  ' DEMO',
  '  demo on | off              toggle the event generator',
  '  demo snipe [mint]          simulate 1 new pool',
  '  demo copy [mint]           simulate 1 target trade',
];

function short(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

/** Executes a command line. All output goes through ctx.log. */
export async function executeCommand(input: string, ctx: CommandContext): Promise<void> {
  const line = input.trim();
  if (!line) return;
  const [cmd, ...args] = line.split(/\s+/);
  const a = (i: number): string => args[i] ?? '';

  try {
    switch (cmd.toLowerCase()) {
      case 'help':
      case '?':
        HELP.forEach((l) => ctx.log('sys', l));
        return;

      case 'clear':
        ctx.clear();
        return;

      case 'status': {
        const { state: s } = await api.state();
        ctx.log('info', `network=${s.network}`);
        ctx.log('info', `wallet=${s.wallet.connectedAddress ? short(s.wallet.connectedAddress) : 'not connected'}  balance=${s.wallet.connectedBalanceSol ?? '?'} SOL`);
        ctx.log(s.copytrade.running ? 'ok' : 'warn', `copytrade=${s.copytrade.running ? 'ON' : 'OFF'}  targets=${s.copytrade.targets.length}  mode=${s.copytrade.amountMode}`);
        ctx.log(s.sniping.running ? 'ok' : 'warn', `sniping=${s.sniping.running ? 'ON' : 'OFF'}  amount=${s.sniping.amountSol} SOL  slippage=${s.sniping.slippageBps}bps`);
        ctx.log('info', `stats: detections=${s.stats.detections} orders=${s.stats.ordersCreated} confirmed=${s.stats.ordersConfirmed} failed=${s.stats.ordersFailed}`);
        return;
      }

      // ---------- WALLET ----------
      case 'connect': {
        if (a(0)) {
          const r = await api.connect(a(0));
          ctx.log('ok', `wallet connected (dev): ${short(r.address)} — ${r.balanceSol.toFixed(4)} SOL`);
        } else {
          ctx.log('info', 'opening Phantom…');
          await ctx.connectPhantom();
        }
        return;
      }
      case 'disconnect':
        await api.disconnect();
        ctx.log('ok', 'wallet disconnected');
        return;

      // ---------- COPYTRADE ----------
      case 'copy': {
        const sub = (a(0) ?? '').toLowerCase();
        if (sub === 'start') return void (await api.copyStart(), ctx.log('ok', 'copytrade started'));
        if (sub === 'stop') return void (await api.copyStop(), ctx.log('warn', 'copytrade stopped'));
        if (sub === 'add') {
          if (!a(1)) throw new Error('usage: copy add <address>');
          await api.copyAdd(a(1));
          return ctx.log('ok', `target added: ${short(a(1))}`);
        }
        if (sub === 'rm') {
          if (!a(1)) throw new Error('usage: copy rm <address>');
          await api.copyRemove(a(1));
          return ctx.log('ok', `target removed: ${short(a(1))}`);
        }
        if (sub === 'list') {
          const { state: s } = await api.state();
          if (!s.copytrade.targets.length) return ctx.log('info', 'no targets');
          s.copytrade.targets.forEach((t, i) => ctx.log('info', `  [${i}] ${t}`));
          return;
        }
        if (sub === 'mode') {
          if (a(1) !== 'fixed' && a(1) !== 'proportional') throw new Error('mode = fixed | proportional');
          await api.copyConfig({ amountMode: a(1) });
          return ctx.log('ok', `copytrade mode = ${a(1)}`);
        }
        if (sub === 'amount') {
          await api.copyConfig({ fixedSol: Number(a(1)) });
          return ctx.log('ok', `copytrade amount = ${a(1)} SOL`);
        }
        if (sub === 'pct') {
          await api.copyConfig({ proportionalPct: Number(a(1)) });
          return ctx.log('ok', `copytrade proportion = ${a(1)}%`);
        }
        throw new Error('unknown copy subcommand (help)');
      }

      // ---------- SNIPING ----------
      case 'snipe': {
        const sub = (a(0) ?? '').toLowerCase();
        if (sub === 'start') return void (await api.snipeStart(), ctx.log('ok', 'sniping started'));
        if (sub === 'stop') return void (await api.snipeStop(), ctx.log('warn', 'sniping stopped'));
        if (sub === 'amount') {
          await api.snipeConfig({ amountSol: Number(a(1)) });
          return ctx.log('ok', `snipe amount = ${a(1)} SOL`);
        }
        if (sub === 'slippage') {
          await api.snipeConfig({ slippageBps: Number(a(1)) });
          return ctx.log('ok', `snipe slippage = ${a(1)} bps`);
        }
        if (sub === 'delay') {
          await api.snipeConfig({ maxDelayMs: Number(a(1)) });
          return ctx.log('ok', `snipe max delay = ${a(1)} ms`);
        }
        throw new Error('unknown snipe subcommand (help)');
      }

      // ---------- ORDERS ----------
      case 'buy': {
        if (!a(0)) throw new Error('usage: buy <mint> [sol]');
        const { order } = await api.createOrder(a(0), Number(a(1) || 0.01));
        ctx.log('ok', `order queued (${order.status}) → approve & sign in ORDERS tab`);
        return;
      }
      case 'orders': {
        const { orders } = await api.state();
        if (!orders.length) return ctx.log('info', 'no orders');
        orders.slice(0, 10).forEach((o) =>
          ctx.log('trade', `${o.engine.padEnd(9)} ${o.status.padEnd(10)} ${o.amountSol}SOL ${short(o.outputMint)}${o.signature ? ` ${o.signature.slice(0, 10)}…` : ''}`),
        );
        return;
      }

      // ---------- DEMO ----------
      case 'demo': {
        const sub = (a(0) ?? '').toLowerCase();
        if (sub === 'on') return void (await api.demoFeed(true), ctx.log('warn', 'demo feeder ON'));
        if (sub === 'off') return void (await api.demoFeed(false), ctx.log('warn', 'demo feeder OFF'));
        if (sub === 'snipe' || sub === 'copy') {
          await api.demoTrigger(sub, a(1) || undefined);
          return ctx.log('detect', `${sub} event simulated → check ORDERS tab`);
        }
        throw new Error('usage: demo on|off|snipe|copy');
      }

      default:
        ctx.log('error', `unknown command: ${cmd} (type "help")`);
    }
  } catch (e: any) {
    ctx.log('error', e?.message ?? String(e));
  }
}

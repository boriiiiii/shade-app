import { API_URL } from "../env";
import type {
  CopyConfig,
  CopyConfigRequest,
  Delegation,
  NonceResponse,
  Order,
  OrderList,
  PrepareDelegationRequest,
  PrepareOrderRequest,
  PreparedDelegation,
  RevokePrepared,
  SideWallet,
  SnipeConfig,
  SnipeConfigRequest,
  SnipeEventRequest,
  TokenResponse,
  Trader,
  User,
  VerifyRequest,
} from "./types";

/**
 * Structured API error. The backend returns `detail` as:
 *  - a string (most HTTPExceptions),
 *  - an object `{code, reason}` (422 order-validation errors),
 *  - a list of `{loc, msg, type}` (Pydantic request-validation errors).
 * We normalise all of them to a single human message + optional machine code.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly reason?: string;
  readonly detail: unknown;

  constructor(
    status: number,
    message: string,
    opts?: { code?: string; reason?: string; detail?: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = opts?.code;
    this.reason = opts?.reason;
    this.detail = opts?.detail;
  }
}

type Detail =
  | string
  | { code?: string; reason?: string }
  | Array<{ msg?: string }>
  | undefined;

function messageFromDetail(status: number, detail: Detail): {
  message: string;
  code?: string;
  reason?: string;
} {
  if (typeof detail === "string") return { message: detail };
  if (Array.isArray(detail)) {
    const msg = detail
      .map((d) => d?.msg)
      .filter(Boolean)
      .join(" · ");
    return { message: msg || `Requête invalide (${status})` };
  }
  if (detail && typeof detail === "object") {
    const { code, reason } = detail as { code?: string; reason?: string };
    if (reason) return { message: reason, code, reason };
  }
  return { message: `Erreur serveur (${status})` };
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    auth = true,
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth && this.token) headers["Authorization"] = `Bearer ${this.token}`;

    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      throw new ApiError(0, `Backend injoignable (${API_URL}). ${String(err)}`);
    }

    if (res.status === 204) return undefined as T;

    let payload: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!res.ok) {
      const detail = (payload as { detail?: Detail } | null)?.detail;
      const { message, code, reason } = messageFromDetail(
        res.status,
        detail ?? (typeof payload === "string" ? payload : undefined),
      );
      throw new ApiError(res.status, message, { code, reason, detail });
    }

    return payload as T;
  }

  // ---- Auth ----
  requestNonce(walletAddress: string): Promise<NonceResponse> {
    return this.request("POST", "/auth/nonce", { wallet_address: walletAddress }, false);
  }
  verify(req: VerifyRequest): Promise<TokenResponse> {
    return this.request("POST", "/auth/verify", req, false);
  }
  me(): Promise<User> {
    return this.request("GET", "/auth/me");
  }
  logout(): Promise<void> {
    return this.request("POST", "/auth/logout");
  }

  // ---- Wallet / delegation ----
  sideWallet(): Promise<SideWallet> {
    return this.request("GET", "/wallet/side-wallet");
  }
  prepareDelegation(req: PrepareDelegationRequest): Promise<PreparedDelegation> {
    return this.request("POST", "/wallet/delegations/prepare", req);
  }
  confirmDelegation(id: string, txSignature: string): Promise<Delegation> {
    return this.request("POST", `/wallet/delegations/${id}/confirm`, {
      tx_signature: txSignature,
    });
  }
  listDelegations(): Promise<Delegation[]> {
    return this.request("GET", "/wallet/delegations");
  }
  revokeDelegation(id: string): Promise<RevokePrepared> {
    return this.request("POST", `/wallet/delegations/${id}/revoke`);
  }

  // ---- Orders ----
  prepareOrder(req: PrepareOrderRequest): Promise<Order> {
    return this.request("POST", "/orders/prepare", req);
  }
  /** Manual mode: POST the user-signed tx (base64); the backend broadcasts it. */
  submitOrder(id: string, signedTxBase64: string): Promise<Order> {
    return this.request("POST", `/orders/${id}/submit`, { signed_tx: signedTxBase64 });
  }
  /** Degen / full_trust: the side wallet executes within the approved limits. */
  executeOrder(id: string): Promise<Order> {
    return this.request("POST", `/orders/${id}/execute`);
  }
  getOrder(id: string): Promise<Order> {
    return this.request("GET", `/orders/${id}`);
  }
  listOrders(): Promise<OrderList> {
    return this.request("GET", "/orders");
  }

  // ---- Copytrade ----
  listTraders(): Promise<Trader[]> {
    return this.request("GET", "/copytrade/traders");
  }
  upsertCopyConfig(req: CopyConfigRequest): Promise<CopyConfig> {
    return this.request("POST", "/copytrade/configs", req);
  }
  listCopyConfigs(): Promise<CopyConfig[]> {
    return this.request("GET", "/copytrade/configs");
  }
  executeCopy(configId: string): Promise<Order> {
    return this.request("POST", `/copytrade/configs/${configId}/execute`);
  }

  // ---- Sniping ----
  upsertSnipeConfig(req: SnipeConfigRequest): Promise<SnipeConfig> {
    return this.request("POST", "/sniping/configs", req);
  }
  getSnipeConfig(): Promise<SnipeConfig> {
    return this.request("GET", "/sniping/config");
  }
  snipeEvent(req: SnipeEventRequest): Promise<Order> {
    return this.request("POST", "/sniping/events", req);
  }
}

export const api = new ApiClient();

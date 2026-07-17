import { ApiError } from "./api/client";

export interface NormalizedError {
  message: string;
  code?: string;
}

/** Turn any thrown value into a user-presentable { message, code }. */
export function toError(err: unknown): NormalizedError {
  if (err instanceof ApiError) {
    return { message: err.message, code: err.code };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: String(err) };
}

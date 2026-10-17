import { API_BASE_URL } from "./config"
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}
/** Shared transport; domain modules validate unknown JSON at their API boundary. */
export async function request(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const timeout = AbortSignal.timeout(15000)
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")
  if (options.body) headers.set("Content-Type", "application/json")
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    signal: options.signal
      ? AbortSignal.any([options.signal, timeout])
      : timeout,
  })
  if (!response.ok)
    throw new ApiError(
      response.status,
      `Yêu cầu thất bại (HTTP ${response.status}).`
    )
  return response.status === 204 ? undefined : response.json()
}

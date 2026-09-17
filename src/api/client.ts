import type { APIRequestContext } from "@playwright/test";

export interface ApiResult<T> {
  status: number;
  ok: boolean;
  body: T;
}

/** Thin typed wrapper over Playwright's request context, scoped to baseURL. */
export class ApiClient {
  constructor(readonly request: APIRequestContext) {}

  async get<T>(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<ApiResult<T>> {
    const res = await this.request.get(path, params ? { params } : undefined);
    return { status: res.status(), ok: res.ok(), body: (await res.json()) as T };
  }
}

import type { Request, Response } from "express";
import { vi } from "vitest";

export interface FakeReqInit {
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
}

export function makeReq(init: FakeReqInit = {}): Request {
  return {
    body: init.body ?? {},
    params: init.params ?? {},
    query: init.query ?? {},
  } as unknown as Request;
}

export interface FakeRes {
  res: Response;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

export function makeRes(): FakeRes {
  const status = vi.fn();
  const json = vi.fn();
  const res = { status, json } as unknown as Response;
  status.mockReturnValue(res);
  json.mockReturnValue(res);
  return { res, status, json };
}

import { vi } from "vitest";

export function createRouterMock() {
  return {
    replace: vi.fn(),
    refresh: vi.fn(),
  };
}

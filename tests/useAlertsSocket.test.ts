import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAlertsSocket } from "@/hooks/useAlertsSocket";

class MockWS {
  static OPEN = 1;
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close() {
    this.readyState = 3;
    this.onclose?.();
  }
  emitOpen() {
    this.readyState = 1;
    this.onopen?.();
  }
  emitMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
  emitClose() {
    this.readyState = 3;
    this.onclose?.();
  }
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAlertsSocket", () => {
  it("buffers alerts until flushed", () => {
    const instances: MockWS[] = [];
    const OriginalWS = global.WebSocket;
    global.WebSocket = vi.fn(() => {
      const i = new MockWS();
      instances.push(i);
      return i as unknown as WebSocket;
    }) as unknown as typeof WebSocket;

    const { result } = renderHook(() => useAlertsSocket({ url: "ws://test", bufferMax: 5 }));
    const ws = instances[0]!;
    act(() => ws.emitOpen());

    act(() => ws.emitMessage({ id: "a", severity: "high", message: "x" }));
    expect(result.current.alerts).toEqual([]);
    act(() => vi.advanceTimersByTime(250));
    expect(result.current.alerts).toHaveLength(1);

    global.WebSocket = OriginalWS;
  });

  it("reconnects with backoff after close", () => {
    const instances: MockWS[] = [];
    global.WebSocket = vi.fn(() => {
      const i = new MockWS();
      instances.push(i);
      return i as unknown as WebSocket;
    }) as unknown as typeof WebSocket;

    const { result } = renderHook(() => useAlertsSocket({ url: "ws://test" }));
    act(() => instances[0]!.emitOpen());
    act(() => instances[0]!.emitClose());

    // Backoff should fire at some point in the next 30s.
    act(() => vi.advanceTimersByTime(2_000));
    expect(instances.length).toBeGreaterThan(1);
    expect(result.current.status === "reconnecting" || result.current.status === "connecting").toBe(true);
  });
});

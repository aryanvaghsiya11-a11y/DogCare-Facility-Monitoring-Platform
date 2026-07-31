import "@testing-library/jest-dom/vitest";
import "./matchers";

// Provide NEXT_PUBLIC env defaults for unit tests.
process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:4000";
process.env.NEXT_PUBLIC_WS_URL ??= "ws://localhost:4000/alerts";

// jsdom has no ResizeObserver; recharts' ResponsiveContainer and the incident
// table's virtualizer both require it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// axe-core probes a 2d context when its color-contrast rule runs; jsdom throws
// "Not implemented" without a stub, which spams test stderr.
const canvasCtx = {
  measureText: () => ({ width: 0 }),
  getImageData: () => ({ data: [] }),
  fillText: () => {},
};
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() =>
    canvasCtx as unknown as CanvasRenderingContext2D) as typeof HTMLCanvasElement.prototype.getContext;
}

// Module augmentation: tell TypeScript about `toHaveNoViolations` on Vitest's
// Assertion interface so tests can use it without `// @ts-ignore`.

import "vitest";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown;
  }
}

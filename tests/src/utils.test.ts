import { createRoot, onCleanup, getOwner, catchError } from "solid-js";
import { describe, test, expect, vi } from "vite-plus/test";

import { runInSubRoot } from "#src/utils.ts";

describe("runInSubRoot", () => {
  test("returns the result of the function", () => {
    createRoot(() => {
      const { result } = runInSubRoot(() => 42);
      expect(result).toBe(42);
    });
  });

  test("returns a dispose function that tears down the sub-root", () => {
    const cleanup = vi.fn();

    createRoot(() => {
      const { dispose } = runInSubRoot(() => {
        onCleanup(cleanup);
      });

      expect(cleanup).not.toHaveBeenCalled();
      dispose();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  test("re-throws errors from the callback", () => {
    createRoot(() => {
      expect(() => {
        runInSubRoot(() => {
          throw new Error("test error");
        });
      }).toThrow("test error");
    });
  });

  test("disposes sub-root when the callback throws", () => {
    const cleanup = vi.fn();

    createRoot(() => {
      try {
        runInSubRoot(() => {
          onCleanup(cleanup);
          throw new Error("test error");
        });
      } catch {
        // expected
      }

      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  test("propagates the error even when a parent error boundary would swallow it", () => {
    createRoot(() => {
      let caught: unknown;
      const boundaryHandler = vi.fn();

      catchError(() => {
        try {
          runInSubRoot(() => {
            throw new Error("boom");
          }, getOwner());
        } catch (e) {
          caught = e;
        }
      }, boundaryHandler);

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toBe("boom");
    });
  });
});

import { createSubRoot } from "@solid-primitives/rootless";
import type { Owner } from "solid-js";

/**
 * Runs `fn` inside a sub-root parented to the given `owner` (or the current
 * owner if none is provided). The sub-root is automatically disposed when
 * its parent is disposed.
 *
 * Unlike a plain `createSubRoot`, this guarantees that synchronous errors
 * thrown by `fn` propagate to the caller — even when an `ErrorBoundary` /
 * `catchError` higher in the owner tree would otherwise swallow them — and
 * disposes the sub-root immediately so partially-registered cleanups run.
 */
export function runInSubRoot<T>(fn: (dispose: () => void) => T, owner?: Owner | null): T {
  let error: unknown;
  let hasError = false;

  const result = createSubRoot(
    (dispose) => {
      try {
        return fn(dispose);
      } catch (e) {
        hasError = true;
        error = e;
        dispose();
        throw e;
      }
    },
    ...(owner ? [owner] : []),
  );

  if (hasError) {
    throw error;
  }

  return result;
}

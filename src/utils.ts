import { createSubRoot } from "@solid-primitives/rootless";
import type { Owner } from "solid-js";

/**
 * Runs `fn` inside a sub-root parented to the given `owner` (or the current
 * owner if none is provided). Returns both the result of `fn` and the sub-root's
 * `dispose` function so callers can tear it down on demand. The sub-root is
 * also automatically disposed when its parent is disposed.
 *
 * Unlike a plain `createSubRoot`, this guarantees that synchronous errors
 * thrown by `fn` propagate to the caller — even when an `ErrorBoundary` /
 * `catchError` higher in the owner tree would otherwise swallow them — and
 * disposes the sub-root immediately so partially-registered cleanups run.
 */
export function runInSubRoot<T>(
  fn: () => T,
  owner?: Owner | null,
): { result: T; dispose: () => void } {
  let error: unknown;
  let hasError = false;
  let disposeFn!: () => void;

  const result = createSubRoot(
    (dispose) => {
      disposeFn = dispose;
      try {
        return fn();
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

  return { result, dispose: disposeFn };
}

import {
  createRoot,
  Owner,
  runWithOwner,
  onCleanup,
  getOwner,
  onError,
} from "solid-js";

function createSubRoot<T>(
  fn: Parameters<typeof createRoot<T>>[0],
  owner: typeof Owner = getOwner()
): T {
  return createRoot((dispose) => {
    owner && runWithOwner(owner, onCleanup.bind(void 0, dispose));
    return fn(dispose);
  }, owner!);
}

export function runInSubRoot<T>(
  fn: Parameters<typeof createRoot<T>>[0],
  owner?: typeof Owner,
  cleanup = false
): T {
  return createSubRoot((dispose) => {
    onError((error) => {
      dispose();
      throw error;
    });

    const result = fn(dispose);
    if (cleanup) dispose();
    return result;
  }, owner);
}

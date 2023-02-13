import { createRoot, Owner, runWithOwner, onCleanup, getOwner } from "solid-js";

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
  owner?: typeof Owner
): T {
  let error: unknown;
  let hasError = false;

  const result = createSubRoot((dispose) => {
    try {
      return fn(dispose);
    } catch (e) {
      hasError = true;
      error = e;
      throw e;
    }
  }, owner);

  if (hasError) {
    throw error;
  }

  return result;
}

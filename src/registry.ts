import { onCleanup, getOwner, runWithOwner } from "solid-js";

export type ServiceInitializer<T> = () => T;

export interface Registry {
  has<T>(initializer: ServiceInitializer<T>): boolean;
  get<T>(initializer: ServiceInitializer<T>): T | undefined;
  register<T>(initializer: ServiceInitializer<T>): T;
  clear(): void;
}

export function createRegistry(): Registry {
  const cache = new Map<ServiceInitializer<any>, any>();
  const owner = getOwner();

  if (owner) {
    onCleanup(() => cache.clear());
  }

  function has<T>(initializer: ServiceInitializer<T>) {
    return cache.has(initializer);
  }

  function get<T>(initializer: ServiceInitializer<T>) {
    return cache.get(initializer);
  }

  function clear() {
    cache.clear();
  }

  function register<T>(initializer: ServiceInitializer<T>) {
    const registration = owner
      ? runWithOwner(owner, () => initializer())
      : initializer();

    cache.set(initializer, registration);

    return registration;
  }

  return { has, get, register, clear } as const;
}

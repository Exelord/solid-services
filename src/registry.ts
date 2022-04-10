import { onCleanup, getOwner, runWithOwner } from "solid-js";

export type ServiceInitializer<T extends Service> = () => T;

export interface Service {}

export interface Registry {
  has<T extends Service>(initializer: ServiceInitializer<T>): boolean;
  get<T extends Service>(initializer: ServiceInitializer<T>): T | undefined;
  register<T extends Service>(initializer: ServiceInitializer<T>): T;
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

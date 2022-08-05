import { getOwner, runWithOwner } from "solid-js";
import { Owner } from "solid-js/types/reactive/signal";

export interface Service extends Record<any, any> {}

export type ServiceInitializer<T extends Service> = () => T;

export class Registry {
  #owner: Owner | null;
  #cache: Map<ServiceInitializer<any>, any>;

  constructor() {
    this.#owner = getOwner();
    this.#cache = new Map<ServiceInitializer<any>, any>();
  }

  has<T extends Service>(initializer: ServiceInitializer<T>): boolean {
    return this.#cache.has(initializer);
  }

  get<T extends Service>(initializer: ServiceInitializer<T>): T | undefined {
    return this.#cache.get(initializer);
  }

  clear(): void {
    this.#cache.clear();
  }

  register<T extends Service>(initializer: ServiceInitializer<T>): T {
    const registration = this.#owner
      ? runWithOwner(this.#owner, () => initializer())
      : initializer();

    this.#cache.set(initializer, registration);

    return registration;
  }
}

export function createRegistry(): Registry {
  return new Registry();
}

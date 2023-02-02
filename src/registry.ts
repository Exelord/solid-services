import { getOwner, runWithOwner, useContext } from "solid-js";
import { Owner } from "solid-js/types/reactive/signal";
import { ServiceRegistryContext } from "./context";

export interface Service extends Record<any, any> {}

export type ServiceInitializer<T extends Service> = () => T;

export interface RegistryConfig {
  expose?: ServiceInitializer<any>[] | boolean;
}

function runInOwner<T>(owner: Owner, fn: () => T): T {
  let error;
  let hasErrored = false;

  const result = runWithOwner(owner, () => {
    try {
      return fn();
    } catch (e) {
      hasErrored = true;
      error = e;
      return;
    }
  })!;

  if (hasErrored) throw error;

  return result;
}

export class Registry {
  #owner: Owner | null;
  #config: RegistryConfig;
  #cache: Map<ServiceInitializer<any>, any>;

  constructor(config: RegistryConfig = {}) {
    this.#config = config;
    this.#owner = getOwner();
    this.#cache = new Map<ServiceInitializer<any>, any>();
  }

  has<T extends Service>(initializer: ServiceInitializer<T>): boolean {
    const parentRegistry = this.getParentRegistry();

    if (parentRegistry?.isExposing(initializer)) {
      return parentRegistry.has(initializer);
    }

    return this.#cache.has(initializer);
  }

  get<T extends Service>(initializer: ServiceInitializer<T>): T | undefined {
    const parentRegistry = this.getParentRegistry();

    if (parentRegistry?.isExposing(initializer)) {
      return parentRegistry.get(initializer);
    }

    return this.#cache.get(initializer);
  }

  clear(): void {
    this.#cache.clear();
  }

  delete<T extends Service>(initializer: ServiceInitializer<T>): void {
    this.#cache.delete(initializer);
  }

  register<T extends Service>(initializer: ServiceInitializer<T>): T {
    const parentRegistry = this.getParentRegistry();

    if (parentRegistry?.isExposing(initializer)) {
      return parentRegistry.register(initializer);
    }

    const registration = this.#owner
      ? runInOwner(this.#owner, initializer)
      : initializer();

    this.#cache.set(initializer, registration);

    return registration;
  }

  protected isExposing<T extends Service>(
    initializer: ServiceInitializer<T>
  ): boolean {
    return (
      this.#config.expose === true ||
      (Array.isArray(this.#config.expose) &&
        this.#config.expose?.includes(initializer))
    );
  }

  private getParentRegistry(): Registry | undefined {
    return this.#owner
      ? runInOwner(this.#owner, () => {
          return useContext(ServiceRegistryContext);
        })
      : undefined;
  }
}

export function createRegistry(config?: RegistryConfig): Registry {
  return new Registry(config);
}

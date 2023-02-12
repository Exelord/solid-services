import { Owner, getOwner, useContext } from "solid-js";
import { ServiceRegistryContext } from "./context";
import { runInSubRoot } from "./utils";

export interface Service extends Record<any, any> {}

export type ServiceInitializer<T extends Service> = () => T;

export interface RegistryConfig {
  expose?: ServiceInitializer<any>[] | boolean;
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
      ? runInSubRoot(initializer, this.#owner)
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
      ? runInSubRoot(
          () => {
            return useContext(ServiceRegistryContext);
          },
          this.#owner,
          true
        )
      : undefined;
  }
}

export function createRegistry(config?: RegistryConfig): Registry {
  return new Registry(config);
}

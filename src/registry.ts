import { Owner, getOwner, useContext } from "solid-js";
import { ServiceRegistryContext } from "./context";
import { runInSubRoot } from "./utils";

export class Service {}

type ServiceConstructor<T extends Service> = new () => T;

export type ServiceInitializer<T extends Service> =
  | (() => T)
  | ServiceConstructor<T>;

export interface RegistryConfig {
  expose?: ServiceInitializer<any>[] | boolean;
}

/**
 * Registry is a container for services.
 * It is used to register and retrieve services.
 */
export class Registry {
  #owner: Owner | null;
  #config: RegistryConfig;
  #cache: Map<ServiceInitializer<any>, any>;

  constructor(config: RegistryConfig = {}) {
    this.#config = config;
    this.#owner = getOwner();
    this.#cache = new Map<ServiceInitializer<any>, any>();
  }

  /**
   * Checks weather the registry has a service registered for the given initializer.
   *
   * First it will check in the parent registry and if no service is registered there,
   * it will check in the current registry.
   */
  has<T extends Service>(initializer: ServiceInitializer<T>): boolean {
    const parentRegistry = this.getParentRegistry();

    if (parentRegistry?.isExposing(initializer)) {
      return parentRegistry.has(initializer);
    }

    return this.#cache.has(initializer);
  }

  /**
   * Returns the service registered for the given initializer.
   *
   * First it will try to find it in the parent registry and if no service is registered there,
   * it will check in the current registry.
   */
  get<T extends Service>(initializer: ServiceInitializer<T>): T | undefined {
    const parentRegistry = this.getParentRegistry();

    if (parentRegistry?.isExposing(initializer)) {
      return parentRegistry.get(initializer);
    }

    return this.#cache.get(initializer);
  }

  /**
   * Clears the registry.
   */
  clear(): void {
    this.#cache.clear();
  }

  /**
   * Deletes registered service for the given initializer.
   */
  delete<T extends Service>(initializer: ServiceInitializer<T>): void {
    this.#cache.delete(initializer);
  }

  /**
   * Registers a service for the given initializer.
   *
   * If the registry has a parent registry, it will check if the service is exposed there.
   *
   * If it is exposed, it will register the service in the parent registry.
   *
   * If it is not exposed, it will register the service in the current registry.
   *
   * If the registry does not have a parent registry, it will register the service in the current registry.
   */
  register<T extends Service>(initializer: ServiceInitializer<T>): T {
    const parentRegistry = this.getParentRegistry();

    if (parentRegistry?.isExposing(initializer)) {
      return parentRegistry.register(initializer);
    }

    const registration = this.#owner
      ? runInSubRoot(() => this.initializeService(initializer), this.#owner)
      : this.initializeService(initializer);

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
      ? runInSubRoot((dispose) => {
          const context = useContext(ServiceRegistryContext);
          dispose();
          return context;
        }, this.#owner)
      : undefined;
  }

  private initializeService<T extends Service>(
    initializer: ServiceInitializer<T>
  ): T {
    return initializer.prototype?.constructor
      ? Reflect.construct(initializer, [])
      : initializer();
  }
}

/**
 * Creates a new registry for services.
 */
export function createRegistry(config?: RegistryConfig): Registry {
  return new Registry(config);
}

import { type Owner, getOwner, useContext } from "solid-js";

import { ServiceRegistryContext } from "#src/context.ts";
import { runInSubRoot } from "#src/utils.ts";

/**
 * Base type for all services. Used purely as a structural marker so that
 * service initializers can be typed against a common shape.
 */
export class Service {}

type ServiceFunction<T extends Service> = () => T;
type ServiceConstructor<T extends Service> = new () => T;

function isServiceConstructor<T extends Service>(
  initializer: ServiceInitializer<T>,
): initializer is ServiceConstructor<T> {
  return Boolean(initializer.prototype?.constructor);
}

/**
 * A service initializer is either a plain factory function or a class constructor.
 * The registry will call it (or `new` it) the first time the service is requested.
 */
export type ServiceInitializer<T extends Service> = ServiceFunction<T> | ServiceConstructor<T>;

/**
 * Configuration options for a {@link Registry}.
 */
export interface RegistryConfig {
  /**
   * Controls which services this registry exposes to child registries.
   *
   * - `true` exposes every service registered here.
   * - An array exposes only the listed initializers.
   * - `false` / omitted keeps services local to this registry.
   */
  expose?: ServiceInitializer<any>[] | boolean;
}

/**
 * Registry is a container for services.
 * It is used to register and retrieve services.
 */
export class Registry {
  #owner: Owner | null;
  #config: RegistryConfig;
  #cache: Map<ServiceInitializer<any>, { instance: any; dispose: () => void }>;

  constructor(config: RegistryConfig = {}) {
    this.#config = config;
    this.#owner = getOwner();
    this.#cache = new Map();
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

    return this.#cache.get(initializer)?.instance;
  }

  /**
   * Clears the registry, disposing every registered service's sub-root.
   */
  clear(): void {
    for (const entry of this.#cache.values()) entry.dispose();
    this.#cache.clear();
  }

  /**
   * Deletes registered service for the given initializer and disposes its sub-root.
   */
  delete<T extends Service>(initializer: ServiceInitializer<T>): void {
    const entry = this.#cache.get(initializer);
    if (!entry) return;
    entry.dispose();
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

    this.#cache.get(initializer)?.dispose();

    const { result: instance, dispose } = runInSubRoot(
      () => this.initializeService(initializer),
      this.#owner,
    );

    this.#cache.set(initializer, { instance, dispose });

    return instance;
  }

  protected isExposing<T extends Service>(initializer: ServiceInitializer<T>): boolean {
    return (
      this.#config.expose === true ||
      (Array.isArray(this.#config.expose) && this.#config.expose?.includes(initializer))
    );
  }

  private getParentRegistry(): Registry | undefined {
    if (!this.#owner?.owner) return undefined;
    const { result, dispose } = runInSubRoot(
      () => useContext(ServiceRegistryContext),
      this.#owner.owner,
    );
    dispose();
    return result;
  }

  private initializeService<T extends Service>(initializer: ServiceInitializer<T>): T {
    return isServiceConstructor(initializer) ? Reflect.construct(initializer, []) : initializer();
  }
}

/**
 * Creates a new registry for services.
 */
export function createRegistry(config?: RegistryConfig): Registry {
  return new Registry(config);
}

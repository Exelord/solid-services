import { createContext, createComponent, useContext, type FlowComponent } from "solid-js";

import { createRegistry, type ServiceInitializer } from "#src/registry.ts";
import type { Registry } from "#src/registry.ts";

/**
 * Props for the {@link ServiceRegistry} component.
 */
export type RegistryProviderProps = {
  /**
   * Controls which services this registry exposes to nested registries.
   *
   * - `true` exposes every service registered here.
   * - An array exposes only the listed initializers.
   * - `false` / omitted keeps services local to this registry.
   */
  expose?: ServiceInitializer<any>[] | boolean;
};

/**
 * Solid context that carries the active {@link Registry}.
 *
 * Prefer using {@link useRegistry} or {@link ServiceRegistry} over reading
 * this context directly.
 */
export const ServiceRegistryContext = createContext<Registry>();

/**
 * Provider component that creates a new {@link Registry} and makes it
 * available to descendants via {@link useRegistry} / `useService`.
 *
 * Wrap your application (or a subtree) with this component to scope
 * services to that part of the tree.
 */
export const ServiceRegistry: FlowComponent<RegistryProviderProps> = (props) => {
  let registry: Registry | undefined;

  return createComponent(ServiceRegistryContext.Provider, {
    get value() {
      return (registry ??= createRegistry({
        get expose() {
          return props.expose;
        },
      }));
    },

    get children() {
      return props.children;
    },
  });
};

/**
 * Returns the current registry.
 *
 * If no registry is found, it will throw an error.
 */
export function useRegistry(): Registry {
  const registry = useContext(ServiceRegistryContext);

  if (!registry) {
    throw new Error(
      "Your app needs to be wrapped with <ServiceRegistry> context in order to use services.",
    );
  }

  return registry;
}

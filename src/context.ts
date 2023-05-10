import { createRegistry, ServiceInitializer } from "./registry";
import type { Registry } from "./registry";

import {
  createContext,
  createComponent,
  useContext,
  FlowComponent,
} from "solid-js";

export type RegistryProviderProps = {
  expose?: ServiceInitializer<any>[] | boolean;
};

export const ServiceRegistryContext = createContext<Registry>();

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
      "Your app needs to be wrapped with <ServiceRegistry> context in order to use services."
    );
  }

  return registry;
}

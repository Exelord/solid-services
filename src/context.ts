import { createRegistry } from "./registry";
import type { Registry } from "./registry";

import {
  createContext,
  createComponent,
  useContext,
  FlowComponent,
} from "solid-js";

export type RegistryProviderProps = {
  registry?: Registry;
};

const ServiceRegistryContext = createContext<Registry>();

export const ServiceRegistry: FlowComponent<RegistryProviderProps> = (
  props
) => {
  let defaultRegistry: Registry;

  function getOrCreateRegistry() {
    defaultRegistry ??= createRegistry();
    return defaultRegistry;
  }

  return createComponent(ServiceRegistryContext.Provider, {
    get value() {
      return props.registry || getOrCreateRegistry();
    },

    get children() {
      return props.children;
    },
  });
};

export function useRegistry(): Registry {
  const registry = useContext(ServiceRegistryContext);

  if (!registry) {
    throw new Error(
      "Your app needs to be wrapped with <ServiceRegistry> context in order to use services."
    );
  }

  return registry;
}

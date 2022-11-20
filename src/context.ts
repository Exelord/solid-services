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
  return createComponent(ServiceRegistryContext.Provider, {
    value: createRegistry({
      get expose() {
        return props.expose;
      },
    }),

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

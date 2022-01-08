import { createRegistry } from "./registry";
import type { Registry } from "./registry";

import {
  createContext,
  Component,
  createMemo,
  createComponent,
  useContext,
} from "solid-js";

export type RegistryProviderProps = {
  registry?: Registry;
};

const ServiceRegistryContext = createContext(createRegistry());

export const ServiceRegistry: Component<RegistryProviderProps> = (props) => {
  const registry = createMemo(() => props.registry || createRegistry());

  return createComponent(ServiceRegistryContext.Provider, {
    get value() {
      return registry();
    },

    get children() {
      return props.children;
    },
  });
};

export function useRegistry() {
  return useContext(ServiceRegistryContext);
}

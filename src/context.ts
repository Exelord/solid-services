import { createRegistry } from "./registry";
import type { Registry } from "./registry";
import { Owner } from "solid-js/types/reactive/signal";

import {
  createContext,
  Component,
  getOwner,
  createComponent,
  useContext,
  runWithOwner,
} from "solid-js";

export type RegistryProviderProps = {
  registry?: Registry;
};

const ServiceRegistryContext = createContext<Registry>();

export const ServiceRegistry: Component<RegistryProviderProps> = (props) => {
  let defaultRegistry: Registry;
  const owner = getOwner();

  function getOrCreateRegistry(owner: Owner | null) {
    defaultRegistry ??= owner
      ? runWithOwner(owner, () => createRegistry())
      : createRegistry();

    return defaultRegistry;
  }

  return createComponent(ServiceRegistryContext.Provider, {
    get value() {
      return props.registry || getOrCreateRegistry(owner);
    },

    get children() {
      return props.children;
    },
  });
};

export function useRegistry(): Registry {
  const registry = useContext(ServiceRegistryContext);

  if (registry) return registry;

  throw new Error(
    "Your app needs to be wrapped with <ServiceRegistry> context in order to use services!"
  );
}

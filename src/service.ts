import { useRegistry } from "./context";
import type { ServiceInitializer } from "./registry";

export function useService<T>(initializer: ServiceInitializer<T>): T {
  const registry = useRegistry();
  return registry.get(initializer) || registry.register(initializer);
}

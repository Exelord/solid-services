import { useRegistry } from "./context";
import type { ServiceInitializer, Service } from "./registry";

export function useService<T extends Service>(
  initializer: ServiceInitializer<T>
): () => T {
  const registry = useRegistry();
  return () => registry.get(initializer) || registry.register(initializer);
}

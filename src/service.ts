import { useRegistry } from "./context";
import type { ServiceInitializer, Service } from "./registry";

export type ServiceGetter<T extends Service> = () => T;

export function useService<T extends Service>(
  initializer: ServiceInitializer<T>
): ServiceGetter<T> {
  const registry = useRegistry();
  return () => registry.get(initializer) || registry.register(initializer);
}

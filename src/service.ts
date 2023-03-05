import { useRegistry } from "./context";
import type { ServiceInitializer, Service } from "./registry";

export type ServiceGetter<T extends Service> = () => T;

/**
 * Returns a getter that returns the service registered for the given initializer.
 * 
 * If no service is registered, it will first register the service using the given initializer.
 */
export function useService<T extends Service>(
  initializer: ServiceInitializer<T>
): ServiceGetter<T> {
  const registry = useRegistry();
  return () => registry.get(initializer) || registry.register(initializer);
}

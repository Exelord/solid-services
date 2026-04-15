import { useRegistry } from "#src/context.ts";
import type { ServiceInitializer, Service } from "#src/registry.ts";

/**
 * A function that, when called, returns the resolved service instance.
 *
 * Returned by {@link useService}. Calling the getter is what triggers
 * lazy initialization on first access.
 */
export type ServiceGetter<T extends Service> = () => T;

/**
 * Returns a getter that returns the service registered for the given initializer.
 *
 * If no service is registered, it will first register the service using the given initializer.
 */
export function useService<T extends Service>(
  initializer: ServiceInitializer<T>,
): ServiceGetter<T> {
  const registry = useRegistry();
  return () => registry.get(initializer) ?? registry.register(initializer);
}

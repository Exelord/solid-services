import { describe, test, expect } from "vitest";
import { createComponent } from "solid-js";
import { ServiceRegistry, useRegistry } from "../../src/context";
import { Registry } from "../../src/registry";

describe("ServiceRegistry", () => {
  test("creates a context", () => {
    const GlobalService = () => {
      return { service: "global" };
    };

    const LocalService = () => {
      return { service: "local" };
    };

    const MyComponent = () => {
      const registry = useRegistry();
      registry.register(LocalService);

      expect(registry.has(LocalService)).toBe(true);
      expect(registry.has(GlobalService)).toBe(false);

      expect(globalRegistry.has(LocalService)).toBe(false);
      expect(globalRegistry.has(GlobalService)).toBe(true);

      return undefined;
    };

    const globalRegistry = new Registry();
    globalRegistry.register(GlobalService);

    createComponent(ServiceRegistry, {
      get registry() {
        return globalRegistry;
      },

      get children() {
        return createComponent(ServiceRegistry, {
          get children() {
            return createComponent(MyComponent, {});
          },
        });
      },
    });
  });

  test("throws error when used without the registry provider", () => {
    const MyComponent = () => {
      expect(() => useRegistry()).toThrowError(
        "Your app needs to be wrapped with <ServiceRegistry> context in order to use services."
      );

      return undefined;
    };

    createComponent(MyComponent, {});
  });
});

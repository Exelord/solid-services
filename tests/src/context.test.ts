import { createComponent } from "solid-js";
import { ServiceRegistry, useRegistry } from "../../src/context";

describe("ServiceRegistry", () => {
  it("creates a context", () => {
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

    const globalRegistry = useRegistry();
    globalRegistry.register(GlobalService);

    createComponent(ServiceRegistry, {
      get children() {
        return createComponent(MyComponent, {});
      },
    });
  });
});

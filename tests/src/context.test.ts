import { describe, test, expect } from "vitest";
import { createComponent } from "solid-js";
import { ServiceRegistry, useRegistry } from "../../src/context";

describe("ServiceRegistry", () => {
  test("allows to expose selected services", () => {
    const GlobalService = () => {
      return { service: "global" };
    };

    const DelegatedService = () => {
      return { service: "global" };
    };

    const LocalService = () => {
      return { service: "local" };
    };

    createComponent(ServiceRegistry, {
      get expose() {
        return [DelegatedService];
      },

      get children() {
        return [
          createComponent(() => {
            const registry = useRegistry();
            registry.register(GlobalService);
            registry.register(DelegatedService);
            return undefined;
          }, {}),
          createComponent(ServiceRegistry, {
            get expose() {
              return [DelegatedService];
            },

            get children() {
              return [
                createComponent(() => {
                  const registry = useRegistry();
                  expect(registry.has(DelegatedService)).toBe(true);
                  expect(registry.has(GlobalService)).toBe(false);
                  return undefined;
                }, {}),
                createComponent(ServiceRegistry, {
                  get children() {
                    return createComponent(() => {
                      const registry = useRegistry();
                      registry.register(LocalService);

                      expect(registry.has(LocalService)).toBe(true);
                      expect(registry.has(DelegatedService)).toBe(true);
                      expect(registry.has(GlobalService)).toBe(false);

                      return undefined;
                    }, {});
                  },
                }),
              ];
            },
          }),
        ];
      },
    });
  });

  test("allows to expose all services", () => {
    const GlobalService = () => {
      return { service: "global" };
    };

    const DelegatedService = () => {
      return { service: "global" };
    };

    const LocalService = () => {
      return { service: "local" };
    };

    createComponent(ServiceRegistry, {
      get expose() {
        return true;
      },

      get children() {
        return [
          createComponent(() => {
            const registry = useRegistry();
            registry.register(GlobalService);
            registry.register(DelegatedService);
            return undefined;
          }, {}),
          createComponent(ServiceRegistry, {
            get expose() {
              return [DelegatedService];
            },

            get children() {
              return [
                createComponent(() => {
                  const registry = useRegistry();
                  expect(registry.has(DelegatedService)).toBe(true);
                  expect(registry.has(GlobalService)).toBe(true);
                  return undefined;
                }, {}),
                createComponent(ServiceRegistry, {
                  get children() {
                    return createComponent(() => {
                      const registry = useRegistry();
                      registry.register(LocalService);

                      expect(registry.has(LocalService)).toBe(true);
                      expect(registry.has(DelegatedService)).toBe(true);
                      expect(registry.has(GlobalService)).toBe(false);

                      return undefined;
                    }, {});
                  },
                }),
              ];
            },
          }),
        ];
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

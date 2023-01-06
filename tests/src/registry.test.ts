import { describe, test, expect, vi } from "vitest";
import { createRegistry } from "../../src/registry";

describe("createRegistry", () => {
  test("registers a service", () => {
    const MyService = () => {
      return { my: "service" };
    };

    const registry = createRegistry();
    const myService = registry.register(MyService);

    expect(myService).toMatchObject({ my: "service" });
  });

  test("gets already registered service", () => {
    const spy = vi.fn();

    const MyService = () => {
      spy();
      return { my: "service" };
    };

    const registry = createRegistry();
    registry.register(MyService);

    const myService = registry.get(MyService);

    expect(myService).toMatchObject({ my: "service" });
    expect(spy).toBeCalledTimes(1);
  });

  test("deletes a registered service", () => {
    const MyService = () => {
      return { my: "service" };
    };

    const registry = createRegistry();

    registry.register(MyService);

    expect(registry.has(MyService)).toBe(true);

    registry.delete(MyService);

    expect(registry.has(MyService)).toBe(false);
  });

  test("check if service is already registered", () => {
    const MyService = () => {
      return { my: "service" };
    };

    const registry = createRegistry();

    expect(registry.has(MyService)).toBe(false);
    registry.register(MyService);
    expect(registry.has(MyService)).toBe(true);
  });
});

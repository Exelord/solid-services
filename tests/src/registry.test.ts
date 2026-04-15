import { createRoot, onCleanup, createSignal } from "solid-js";
import { describe, test, expect, vi } from "vite-plus/test";

import { createRegistry } from "#src/registry.ts";

describe("createRegistry", () => {
  test("registers a service", () => {
    const MyService = () => {
      return { my: "service" };
    };

    const registry = createRegistry();
    const myService = registry.register(MyService);

    expect(myService).toMatchObject({ my: "service" });
  });

  test("registers a class service", () => {
    class AuthService {
      loggedIn = true;
    }

    const registry = createRegistry();
    const myService = registry.register(AuthService);

    expect(myService).toBeInstanceOf(AuthService);
    expect(myService.loggedIn).toBe(true);
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

  test("cleans up services when the root is disposed", () => {
    const cleanup = vi.fn();

    const MyService = () => {
      onCleanup(cleanup);
      return { my: "service" };
    };

    let disposeRoot!: () => void;

    createRoot((dispose) => {
      disposeRoot = dispose;
      const registry = createRegistry();
      registry.register(MyService);
    });

    expect(cleanup).not.toHaveBeenCalled();
    disposeRoot();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test("cleans up each service independently when root is disposed", () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();

    const Service1 = () => {
      onCleanup(cleanup1);
      return { id: 1 };
    };

    const Service2 = () => {
      onCleanup(cleanup2);
      return { id: 2 };
    };

    let disposeRoot!: () => void;

    createRoot((dispose) => {
      disposeRoot = dispose;
      const registry = createRegistry();
      registry.register(Service1);
      registry.register(Service2);
    });

    disposeRoot();

    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(1);
  });

  test("propagates errors from service initialization", () => {
    const FailingService = () => {
      throw new Error("init failed");
    };

    createRoot(() => {
      const registry = createRegistry();
      expect(() => registry.register(FailingService)).toThrow("init failed");
    });
  });

  test("does not cache services that failed to initialize", () => {
    const FailingService = () => {
      throw new Error("init failed");
    };

    createRoot(() => {
      const registry = createRegistry();

      try {
        registry.register(FailingService);
      } catch {
        // expected
      }

      expect(registry.has(FailingService)).toBe(false);
    });
  });

  test("disposes sub-root immediately when service initialization fails", () => {
    const cleanup = vi.fn();

    const FailingService = () => {
      onCleanup(cleanup);
      throw new Error("init failed");
    };

    createRoot(() => {
      const registry = createRegistry();

      try {
        registry.register(FailingService);
      } catch {
        // expected
      }

      // Cleanup should have already run from the disposed sub-root,
      // not deferred to the parent root disposal
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  test("services can use reactive primitives", () => {
    createRoot(() => {
      const ReactiveService = () => {
        const [count, setCount] = createSignal(0);
        return { count, setCount };
      };

      const registry = createRegistry();
      const service = registry.register(ReactiveService);

      expect(service.count()).toBe(0);
      service.setCount(5);
      expect(service.count()).toBe(5);
    });
  });

  test("delete() disposes the removed service's sub-root", () => {
    const cleanup = vi.fn();

    const MyService = () => {
      onCleanup(cleanup);
      return { my: "service" };
    };

    createRoot(() => {
      const registry = createRegistry();
      registry.register(MyService);
      registry.delete(MyService);

      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  test("clear() disposes every cached service's sub-root", () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();

    const Service1 = () => {
      onCleanup(cleanup1);
      return { id: 1 };
    };
    const Service2 = () => {
      onCleanup(cleanup2);
      return { id: 2 };
    };

    createRoot(() => {
      const registry = createRegistry();
      registry.register(Service1);
      registry.register(Service2);
      registry.clear();

      expect(cleanup1).toHaveBeenCalledTimes(1);
      expect(cleanup2).toHaveBeenCalledTimes(1);
    });
  });

  test("register() replaces the existing instance on re-register", () => {
    let constructorCalls = 0;
    const MyService = () => {
      constructorCalls++;
      return { id: constructorCalls };
    };

    createRoot(() => {
      const registry = createRegistry();
      const a = registry.register(MyService);
      const b = registry.register(MyService);

      expect(a).not.toBe(b);
      expect(constructorCalls).toBe(2);
      expect(registry.get(MyService)).toBe(b);
    });
  });

  test("re-register does not leak the previous instance's sub-root", () => {
    const cleanup = vi.fn();
    const MyService = () => {
      onCleanup(cleanup);
      return {};
    };

    createRoot(() => {
      const registry = createRegistry();
      registry.register(MyService);
      registry.register(MyService);

      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });
});

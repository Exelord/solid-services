import { describe, test, expect, vi } from "vitest";
import { createComponent } from "solid-js";
import { useService } from "../../src/service";
import { ServiceRegistry } from "../../src/context";

describe("useService", () => {
  test("registers a service if it does not exist", () => {
    const spy = vi.fn();

    const MyService = () => {
      spy();
      return { service: "my" };
    };

    const MyComponent = () => {
      const myService = useService(MyService);

      expect(myService()).toMatchObject({ service: "my" });
      expect(spy).toBeCalledTimes(1);

      const myServiceAgain = useService(MyService);

      expect(myServiceAgain()).toBe(myService());
      expect(spy).toBeCalledTimes(1);

      return undefined;
    };

    createComponent(ServiceRegistry, {
      get children() {
        return createComponent(MyComponent, {});
      },
    });
  });
});

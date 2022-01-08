import { createRegistry } from "../../src/registry";

describe("createRegistry", () => {
  it("registers a service", () => {
    const MyService = () => {
      return { my: "service" };
    };

    const registry = createRegistry();
    const myService = registry.register(MyService);

    expect(myService).toMatchObject({ my: "service" });
  });

  it("gets already registered service", () => {
    const spy = jest.fn();

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

  it("check if service is already registered", () => {
    const MyService = () => {
      return { my: "service" };
    };

    const registry = createRegistry();

    expect(registry.has(MyService)).toBe(false);
    registry.register(MyService);
    expect(registry.has(MyService)).toBe(true);
  });
});

import { createComponent } from "solid-js";
import { useService } from "../../src/service";

describe("useService", () => {
  it("registers a service if it does not exist", () => {
    const spy = jest.fn();

    const MyService = () => {
      spy();
      return { service: "my" };
    };

    const MyComponent = () => {
      const myService = useService(MyService);

      expect(myService).toMatchObject({ service: "my" });
      expect(spy).toBeCalledTimes(1);

      const myServiceAgain = useService(MyService);

      expect(myServiceAgain).toBe(myService);
      expect(spy).toBeCalledTimes(1);

      return undefined;
    };

    createComponent(MyComponent, {});
  });
});

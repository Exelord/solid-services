<p align="center">
  <img src="https://raw.githubusercontent.com/exelord/solid-services/main/logo.png" alt="Solid Services logo" />
</p>

# Solid Services

Solid Services is a package that provides a way to manage shared state and persistent connections in Solid.js applications. It consists of a `ServiceRegistry` component, which creates a context around your components and allows you to scope the services to specific parts of the application, and the `useService` hook, which registers a service or returns an existing object if it has already been used in the past.

## Installation

```sh
npm install solid-services
```

## Compatibility

- Solid.js ^1.0

## Demo

[Open on CodeSandbox](https://codesandbox.io/s/solid-services-uqlnw)

## Services

Service is an object that provides a particular function or set of functions. Services are designed to be "global" objects that can be accessed and used throughout an application, and are often used for features that require shared state or persistent connections.

Some common examples of services include user authentication, geolocation, WebSockets, server-sent events or notifications, server-backed API call libraries, third-party APIs, and logging. Services can be implemented as either a class or a plain object (POJO) and are usually defined as a function that returns an instance of the class or object. For example:

```js
import { createSignal } from 'solid-js';

export function AuthService() {
  const [getUser, setUser] = createSignal();

  return {
    get user() {
      return getUser();
    },

    login(user) {
      setUser(user);
    },

    logout() {
      setUser(undefined);
    },
  };
}
```

To access a service in your components or other services, you can use the `useService` hook. This hook registers the service or returns an existing object if it has already been used in the past. For example:

```jsx
import { useService } from "solid-services";
import AuthService from "./services/auth";

export default function LogoutComponent() {
  const getAuthService = useService(AuthService);

  function logout() {
    getAuthService().logout();
  }

  return <button onClick={logout}>Logout</button>;
}
```

## Service Registry

The `ServiceRegistry` is a component that creates a context around the components within an application, allowing developers to scope the services to specific parts of the application.

To use the `ServiceRegistry`, you can simply wrap the components that you want to be within the context of the registry in a <ServiceRegistry> element. For example:

```jsx
import { ServiceRegistry } from 'solid-services';

export default function App() {
  return (
    <ServiceRegistry>
      {/* All components within this element will have access to the services defined in this registry */}
      <SomeComponent />
      <AnotherComponent />
    </ServiceRegistry>
  );
}
```

> ## **Remember!**
>
> It is important to wrap your application with a top-level `<ServiceRegistry>` before using services in components. Otherwise, services won't be able to register and their usage will throw an error.

By default, the ServiceRegistry does not expose any services to sub-registries. This means that the components within a sub-registry will not have access to the services defined in the parent registry. However, you can configure this behavior using the `expose` property of the ServiceRegistry.

For example, to expose a specific service to a sub-registry, you can set the `expose` property to an array containing the service(s) that you want to expose:

```jsx
import { ServiceRegistry } from 'solid-services';
import AuthService from './services/auth';

export default function App() {
  return (
    <ServiceRegistry expose={[AuthService]}>
      {/* All components within this element will have access
          to all the services defined in this registry */}
      
      <ServiceRegistry>
        {/* All components within this element will have access
            to the AuthService from the parent registry,
            as well as any services defined in this registry */}
      </ServiceRegistry>
    </ServiceRegistry>
  );
}
```

You can also set the `expose` property to `true` to expose all services to sub-registries. This can be useful if you want to granularly control the availability of services in different parts of your application.

```jsx
import { ServiceRegistry } from 'solid-services';

export default function App() {
  return (
    <ServiceRegistry expose={true}>
      {/* All components within this element will have access to the services defined in this registry */}
      
      <ServiceRegistry>
        {/* All components within this element will have access to all services from the parent registry,
            as well as any services defined in this registry */}
      </ServiceRegistry>
    </ServiceRegistry>
  );
}
```

By using the ServiceRegistry and the expose property, you can control which services are available to different parts of your application, and manage the shared state and persistent connections within your Solid.js application.

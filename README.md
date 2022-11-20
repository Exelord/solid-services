<p align="center">
  <img src="https://raw.githubusercontent.com/exelord/solid-services/main/logo.png" alt="Solid Services logo" />
</p>

# Solid Services

Services are "global" objects useful for features that require shared state or persistent connections. They are lazy evaluated, only when used, solving an issue of cross dependencies and contexts tree.

Example uses of services might include:

- User/session authentication
- Geolocation
- WebSockets
- Server-sent events or notifications
- Server-backed API calls libraries
- Third-party APIs
- Logging

## Installation

```
npm i solid-services
```

## Compatibility

- Solid.js ^1.0

## Demo

[Open on CodeSandbox](https://codesandbox.io/s/solid-services-uqlnw)

## Using a ServiceRegistry

`ServiceRegistry` will create a context around your components allowing you to scope the services to specific part of the application.

```tsx
// app.tsx
import { ServiceRegistry } from 'solid-services';

export default App(props) {
  return (
    <ServiceRegistry>
      {props.children}
    </ServiceRegistry>
  )
}
```

## Defining a service

To define a service define a function that returns an instance of a class or a POJO object.

```ts
// eg. ./services/auth.ts

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
      setUser(undefined)
    },
  }
}
```

## Accessing a service

To access a service in your components or other services use `useService()`. It will register a service or return existing object if it was already used in the past.

```tsx
// components/logout.tsx
import { useService } from "solid-services";
import AuthService from "../services/auth";

export default function LogoutComponent() {
  const getAuthService = useService(AuthService);
  
  function logout() {
    getAuthService().logout();
  }
  
  return <button onClick={logout}>Logout<button>
}
```

## Exposing services to sub registries

By default registry does not expose any services to sub registries. It means that they cannot access or use services from the parent registry. You can configure this behavior by using `expose` property of `ServiceRegistry` and choose which services should be shared with sub registries.

Example of isolated services:

```tsx
import { ServiceRegistry } from 'solid-services';

export default App() {
  return (
    <ServiceRegistry>
      // Here you can access all services defined in this registry

      <ServiceRegistry>
        // Here you cannot access services defined in the parent registry
      <ServiceRegistry>
    </ServiceRegistry>
  )
}
```

Example of exposed services:

```tsx
import { ServiceRegistry } from 'solid-services';
import AuthService from "../services/auth";

export default App() {
  return (
    <ServiceRegistry expose={[AuthService]}>
      // Here you can access all services defined in this registry

      <ServiceRegistry>
        // Here you can access services defined in this registry + the AuthService from parent registry
      <ServiceRegistry>
    </ServiceRegistry>
  )
}
```

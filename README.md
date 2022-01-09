<p align="center">
  <img src="https://raw.githubusercontent.com/exelord/solid-services/main/logo.png" alt="Solid Services logo" />
</p>

# Solid Services

Services are "global" objects useful for features that require shared state or persistent connections. Example uses of services might include:

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

By default, you don't need to do anything as your application will use a global registry. However, if you plan to run a few apps on one page it might be good idea to isolate their services states.

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
    }

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
  const authService = useService(AuthService)
  
  function logout() {
    authService.logout();  
  }
  
  return <button onClick={logout}>Logout<button>
}
```
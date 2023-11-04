# Compose

A drop-in extension for Promises, adding oodles of functional goodness through
composition and taking error handling to an entirely different level.


## Features

* **Lightweight and with almost no memory footprint,** the main package export
  comes in at well below 1KB, unminified, ungzipped.

* **A familiar Promise like interface** reduces the learning curve
  dramatically.

* **Robust types for TypeScript** are included in the package by default, with
  specific attention in areas such as scope narrowing, for heavily nested and
  complex compositions.

* **Interoperable with existing code by design,** to ensure that it's easy to
  introduce incrementally to your project without any pesky migrations.


## Installation

Compose is available from the NPM registry and as a GitHub Package. Whichever
source you prefer to use, the installation should remain the same.

```sh
# Using NPM
npm install @emphori/compose -S

# Or, using Yarn
yarn add @emphori/compose
```


## Examples

```ts
import { compose, reject } from '@emphori/compose'
import type { Promise } from '@emphori/promise'

// (userId: string) => Promise<Org, UserNotFound | OrgNotFound>
const getUserOrg = compose(getUser).then(getOrgForUser)

function getUser(userId: string): Promise<User, UserNotFound> {
  return User.getById(userId).then((user) => {
    return user ?? reject(UserNotFound)
  })
}

function getOrgForUser(user: User): Promise<Org, OrgNotFound> {
  return Org.getById(user.orgId).then((org) => {
    return org ?? reject(OrgNotFound)
  })
}
```


## Contributing

If you're interested in contributing, or just want to learn more about Compose,
then head over to the [repository][repo] where you'll hopefully find all the
information you need.

[repo]: https://github.com/emphori/compose


## Licence

This project is released under the [MIT License][license]. Enjoy responsibly ❤️

[license]: https://github.com/emphori/compose/blob/HEAD/LICENSE


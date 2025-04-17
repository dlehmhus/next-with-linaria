# Next.js + Linaria

## What is this?

This package provides seamless integration between Next.js and Linaria, a zero-runtime CSS-in-JS solution. It allows you to use Linaria's powerful styling capabilities directly in your Next.js applications, with full support for both the App Router and Pages Router.

## Try it

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/next-with-linaria?file=app%2Fpage.tsx)

## Installation

<details open><summary>npm</summary>

```sh
    npm install next-with-linaria @wyw-in-js/babel-preset @linaria/core @linaria/react
```

</details>
<details><summary>pnpm</summary>

```sh
    pnpm install next-with-linaria @wyw-in-js/babel-preset @linaria/core @linaria/react
```

</details>
<details><summary>yarn</summary>

```sh
    yarn add next-with-linaria @wyw-in-js/babel-preset @linaria/core @linaria/react
```

</details>

## Usage

### Webpack / Turbopack\*

```ts
// next.config.ts
import withLinaria, { LinariaConfig } from 'next-with-linaria';

const config: LinariaConfig = {
  // ...your next.js config
  linaria: {
    // Linaria options here
  },
};

export default withLinaria(config);
```

\*The Turbopack loader currently only works for client components due to a [bug](https://github.com/vercel/next.js/issues/78096) in Turbopack.

### Rspack

To use Rspack instead of Webpack, you can combine this package with `next-rspack`:

```ts
// next.config.ts
import withRspack from 'next-rspack';
import withLinaria, { LinariaConfig } from 'next-with-linaria';

const config: LinariaConfig = {
  // ...your next.js config
  linaria: {
    // Linaria options here
  },
};

export default withRspack(withLinaria(config));
```

Now you can use linaria in all the places where Next.js also allows you to use [CSS Modules](https://beta.nextjs.org/docs/styling/css-modules). That currently means in every file in the `app` directory and the `pages` directory.

## Performance Optimization

The `fastCheck` option is enabled by default to improve build performance. This optimization skips the Linaria transform process for files that don't contain Linaria syntax, which can reduce build times for large projects.

If you experience any issues with the optimization, you can disable it:

```js
// next.config.js
const withLinaria = require('next-with-linaria');

/** @type {import('next-with-linaria').LinariaConfig} */
const config = {
  // ...your next.js config
  linaria: {
    // Disable performance optimization if needed
    fastCheck: false,
  },
};
module.exports = withLinaria(config);
```

## Restrictions

### Global Styles

If you want to use linaria for [global styling](https://beta.nextjs.org/docs/styling/global-styles), you need to place those styles into a file with the suffix `.linaria.global.(js|jsx|ts|tsx)`:

```tsx
// app/style.linaria.global.tsx
import { css } from '@linaria/core';

export const globals = css`
  :global() {
    html {
      box-sizing: border-box;
    }

    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }

    @font-face {
      font-family: 'MaterialIcons';
      src: url(../assets/fonts/MaterialIcons.ttf) format('truetype');
    }
  }
`;
```

```tsx
// app/layout.tsx
import './style.linaria.global';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

This convention is needed because the loader needs to know which files contain global styles and which don't.

## Limitations

- In Webpack and Rspack you can not use linaria styles in server-only files or in server components that import server-only files due to the way HMR works in dev mode.

```tsx
// app/components/ServerOnlyComponent.tsx
import 'server-only';
import { styled } from '@linaria/react';

const Container = styled.div`
  color: red;
`;

export default function ServerOnlyComponent() {
  return <Container>Hello World</Container>;
}
```

In such a case you need to use the following approach:

```tsx
// app/components/Container.tsx
import { styled } from '@linaria/react';
export const Container = styled.div`
  color: red;
`;

// app/components/ServerOnlyComponent.tsx
import 'server-only';
import { Container } from './Container';

export default function ServerOnlyComponent() {
  return <Container>Hello World</Container>;
}
```

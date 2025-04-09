# Next.js + Linaria

## What is this?

Since the Next.js app directory feature doesn't work with the [@linaria/webpack5-loader](https://github.com/callstack/linaria/tree/master/packages/webpack5-loader) anymore, therefore the [next-linaria](https://github.com/Mistereo/next-linaria) package sadly also doesn't work. This package solves that issue with a custom linaria webpack loader.

## Try it before you buy it

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

### Basic Setup

```js
// next.config.js
const withLinaria = require('next-with-linaria');

/** @type {import('next-with-linaria').LinariaConfig} */
const config = {
  // ...your next.js config
  linaria: {
    // Linaria options here
  },
};
module.exports = withLinaria(config);
```

### Rspack Support

To use Rspack instead of Webpack, you can combine this package with `next-rspack`:

```js
// next.config.js
const withRspack = require('next-rspack');
const withLinaria = require('next-with-linaria');

/** @type {import('next-with-linaria').LinariaConfig} */
const config = {
  // ...your next.js config
  linaria: {
    // Linaria options here
  },
};

module.exports = withRspack(withLinaria(config));
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

## Global Styles Restrictions

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

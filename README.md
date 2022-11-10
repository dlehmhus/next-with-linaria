# Next.js 13 + Linaria

## What is this?

The new Next.js 13 app directory feature doesn't work with the [@linaria/webpack5-loader](https://github.com/callstack/linaria/tree/master/packages/webpack5-loader) anymore, therefore the [next-linaria](https://github.com/Mistereo/next-linaria) package sadly also doesn't work. This package solves that issue with a custom linaria webpack loader and [Webpack Virtual Modules](https://github.com/sysgears/webpack-virtual-modules).

## Disclaimer

⚠️ This package is still in development and not battle tested yet! Don't use it in production. ⚠️

## Installation

<details open><summary>npm</summary>

```sh
    npm install next-with-linaria @linaria/babel-preset @linaria/core @linaria/react
```

</details>
<details><summary>pnpm</summary>

```sh
    pnpm install next-with-linaria @linaria/babel-preset @linaria/core @linaria/react
```

</details>
<details><summary>yarn</summary>

```sh
    yarn add next-with-linaria @linaria/babel-preset @linaria/core @linaria/react
```

</details>

## Usage

```js
// next.config.js
const withLinaria = require('next-with-linaria');

/** @type {import('next-with-linaria').LinariaConfig} */
const config = {
  experimental: {
    appDir: true,
  },
};
module.exports = withLinaria(config);
```

Now you can use linaria in all the places where Next.js also allows you to use [CSS Modules](https://beta.nextjs.org/docs/styling/css-modules). That currently means in every file in in the `app` directory. And the `pages` directory of course as well.

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

## Good to know

Because webpack 5 caches modules, the virtual CSS Modules need to be cached as well (so at that point the are not really virtual anymore, are they? Anyway...). They are placed in the same directory as where webpack puts its cache files. If the `next-with-linaria` cache is not in sync with the webpack cache anymore, it will cause errors due to missing CSS Modules. If you encounter such an error, you can delete the `.next/cache/webpack` folder and restart the dev server.

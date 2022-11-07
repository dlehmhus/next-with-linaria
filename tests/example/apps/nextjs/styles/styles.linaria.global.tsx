import { css } from '@linaria/core';

export const globals = css`
  :global() {
    body {
      border: 1rem solid blueviolet;
      border-radius: 2rem;
      padding: 1rem;
      content: 'Linaria global CSS';
    }
  }
`;

import '../styles/global.css';
import '../styles/styles.linaria.global.tsx';

import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

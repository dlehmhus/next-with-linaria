'use client';
import Link from 'next/link';
import React from 'react';

import styles from './styles.module.css';

export default function CssModuleLink() {
  return (
    <Link
      href="/posts"
      prefetch={false}
      data-testid="css-module-button"
      className={styles.link}
    >
      CssModule: Client Link
    </Link>
  );
}

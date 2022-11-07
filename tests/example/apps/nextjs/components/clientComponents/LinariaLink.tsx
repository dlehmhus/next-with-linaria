'use client';
import { styled } from '@linaria/react';
import Link from 'next/link';
import React from 'react';

const Container = styled.div`
  background-color: yellow;
  content: 'Linaria Link';
`;

export default function LinariaButton() {
  return (
    <Link href="/posts" prefetch={false}>
      <Container data-testid="linaria-button">Linaria: Client Link</Container>
    </Link>
  );
}

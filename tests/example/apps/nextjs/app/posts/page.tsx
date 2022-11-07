import { styled } from '@linaria/react';
import React, { Suspense } from 'react';

import PostFeedComponent from '../../components/serverComponents/PostFeed';

const Loading = styled.div`
  content: 'Linaria Loading CSS';
`;
const PostFeed = PostFeedComponent as unknown as React.FC;
export default function PostPage() {
  return (
    <Suspense
      fallback={
        <Loading data-testid="linaria-loading">Loading feed...</Loading>
      }
    >
      <PostFeed />
    </Suspense>
  );
}

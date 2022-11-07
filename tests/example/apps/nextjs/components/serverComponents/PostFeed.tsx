import { styled } from '@linaria/react';

async function loadPosts(): Promise<{ posts: string[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ posts: ['Post A', 'Post B', 'Post C'] });
    }, 1000);
  });
}

const Post = styled.h3`
  border: 1rem solid;
  border-color: brown;
  content: 'Linaria Post';
`;
export default async function PostFeed() {
  const posts = await loadPosts();
  return (
    <div>
      {posts.posts.map((post) => (
        <Post key={post} data-testid="linaria-post">
          {post}
        </Post>
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { postsApi } from '../api/posts';
import PostCard from '../components/PostCard';
import type { Post } from '../types';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    postsApi
      .getAll()
      .then(setPosts)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Failed to load posts',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="container">
        <p className="loading-text">Loading posts...</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="container">
        <p className="error-text">{error}</p>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="hero">
        <p className="hero-overline">Journal</p>
        <h1 className="hero-title">Latest Posts</h1>
        <p className="hero-subtitle">Thoughts, ideas, and guides.</p>
      </header>

      {posts.length === 0 ? (
        <p className="empty-text">No posts yet. Be the first to write one!</p>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}

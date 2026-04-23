import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsApi } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import type { Post } from '../types';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    postsApi
      .getOne(id)
      .then(setPost)
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Delete this post?')) return;
    try {
      await postsApi.remove(id);
      navigate('/');
    } catch {
      setError('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <main className="container">
        <p className="loading-text">Loading...</p>
      </main>
    );
  }
  if (error || !post) {
    return (
      <main className="container">
        <p className="error-text">{error || 'Not found'}</p>
      </main>
    );
  }

  const authorName = post.user
    ? `${post.user.firstName} ${post.user.lastName}`
    : 'Unknown';

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const canEdit = user?.id === post.authorId || user?.role === 'ADMIN';

  return (
    <>
      <main className="container container--reading post-detail">
        {post.thumbnail && (
          <img src={post.thumbnail} alt={post.title} className="post-detail-img" />
        )}

        <header className="post-detail-header">
          <p className="post-detail-meta">
            {authorName} · {date} · 👁 {post.viewCount}
          </p>
          <h1>{post.title}</h1>

          {canEdit && (
            <div className="post-actions">
              <Link to={`/posts/${id}/edit`} className="btn btn-secondary">
                Edit
              </Link>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </header>

        <div className="post-detail-content">
          {post.content.split('\n').map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : <br key={i} />,
          )}
        </div>
      </main>

      <section className="section-dark" aria-label="Comments">
        <div className="container container--reading">
          <CommentSection postId={post.id} />
        </div>
      </section>
    </>
  );
}

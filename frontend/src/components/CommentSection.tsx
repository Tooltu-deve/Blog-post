import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commentsApi } from '../api/comments';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types';

interface Props {
  postId: string;
}

export default function CommentSection({ postId }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    commentsApi
      .getByPost(postId)
      .then(setComments)
      .catch(() => setError('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await commentsApi.create({ content, postId });
      setComments((prev) => [...prev, newComment]);
      setContent('');
    } catch {
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await commentsApi.remove(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Failed to delete comment');
    }
  };

  return (
    <section className="comments-section">
      <h3 className="comments-title">Comments ({comments.length})</h3>

      {isAuthenticated && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="comment-input"
            rows={3}
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !content.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {!isAuthenticated && (
        <p className="comments-login-hint">
          <Link to="/login">Login</Link> to leave a comment.
        </p>
      )}

      {loading ? (
        <p className="loading-text">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="empty-text">No comments yet. Be the first!</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => {
            const authorName = c.author
              ? `${c.author.firstName} ${c.author.lastName}`
              : 'Unknown';
            const date = new Date(c.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const canDelete =
              user?.id === c.authorId || user?.role === 'ADMIN';

            return (
              <li key={c.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{authorName}</span>
                  <span className="comment-date">{date}</span>
                  {canDelete && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="comment-content">{c.content}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

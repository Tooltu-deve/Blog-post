import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsApi } from '../api/posts';
import { useAuth } from '../context/AuthContext';

export default function PostForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    title: '',
    content: '',
    thumbnail: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isEditing) return;
    postsApi.getOne(id).then((post) => {
      setForm({
        title: post.title,
        content: post.content,
        thumbnail: post.thumbnail ?? '',
        status: post.status,
      });
    });
  }, [id, isEditing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        thumbnail: form.thumbnail || undefined,
      };
      if (isEditing) {
        await postsApi.update(id, payload);
        navigate(`/posts/${id}`);
      } else {
        const post = await postsApi.create(payload);
        navigate(`/posts/${post.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [field]: e.target.value });

  return (
    <main className="container">
      <div className="post-form-card">
        <h1>{isEditing ? 'Edit Post' : 'New Post'}</h1>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={set('title')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail">Thumbnail URL (optional)</label>
            <input
              id="thumbnail"
              type="url"
              className="form-input"
              value={form.thumbnail}
              onChange={set('thumbnail')}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="form-input"
              value={form.status}
              onChange={set('status')}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              className="form-input form-textarea"
              rows={14}
              value={form.content}
              onChange={set('content')}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

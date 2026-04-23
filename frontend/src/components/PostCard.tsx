import { Link } from 'react-router-dom';
import type { Post } from '../types';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const authorName = post.user
    ? `${post.user.firstName} ${post.user.lastName}`
    : 'Unknown';

  const excerpt =
    post.content.length > 160
      ? post.content.slice(0, 160) + '...'
      : post.content;

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="post-card">
      {post.thumbnail && (
        <img src={post.thumbnail} alt={post.title} className="post-card-img" />
      )}
      <div className="post-card-body">
        <p className="post-card-meta">
          {authorName} · {date} · 👁 {post.viewCount}
        </p>
        <h2 className="post-card-title">
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h2>
        <p className="post-card-excerpt">{excerpt}</p>
        <Link to={`/posts/${post.id}`} className="post-card-link">
          Read more →
        </Link>
      </div>
    </article>
  );
}

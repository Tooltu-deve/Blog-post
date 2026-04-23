export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  viewCount: number;
  authorId: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: string;
  author?: {
    firstName: string;
    lastName: string;
  };
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

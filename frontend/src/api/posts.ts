import { api } from './client';
import type { Post } from '../types';

export const postsApi = {
  getAll: () => api.get<Post[]>('/posts'),
  getOne: (id: string) => api.get<Post>(`/posts/${id}`),
  create: (data: {
    title: string;
    content: string;
    thumbnail?: string;
    status?: 'DRAFT' | 'PUBLISHED';
  }) => api.post<Post>('/posts', data),
  update: (
    id: string,
    data: Partial<{
      title: string;
      content: string;
      thumbnail: string;
      status: 'DRAFT' | 'PUBLISHED';
    }>,
  ) => api.patch<Post>(`/posts/${id}`, data),
  remove: (id: string) => api.delete<void>(`/posts/${id}`),
};

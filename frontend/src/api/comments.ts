import { api } from './client';
import type { Comment } from '../types';

export const commentsApi = {
  getByPost: (postId: string) =>
    api.get<Comment[]>(`/comments?postId=${postId}`),
  create: (data: { content: string; postId: string }) =>
    api.post<Comment>('/comments', data),
  remove: (id: string) => api.delete<void>(`/comments/${id}`),
};

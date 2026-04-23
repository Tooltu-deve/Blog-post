import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: {
    post: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      post: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne view counting', () => {
    const publishedPost = {
      id: 'post-1',
      status: 'PUBLISHED',
      authorId: 'author-1',
      viewCount: 5,
    };
    const draftPost = { ...publishedPost, status: 'DRAFT' };

    it('increments viewCount for anonymous viewer on published post', async () => {
      prisma.post.findUnique.mockResolvedValue(publishedPost);
      prisma.post.update.mockResolvedValue({ ...publishedPost, viewCount: 6 });

      const result = await service.findOne('post-1');

      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { viewCount: { increment: 1 } },
      });
      expect(result.viewCount).toBe(6);
    });

    it('does not increment viewCount when viewer is the author', async () => {
      prisma.post.findUnique.mockResolvedValue(publishedPost);

      const result = await service.findOne('post-1', 'author-1');

      expect(prisma.post.update).not.toHaveBeenCalled();
      expect(result).toEqual(publishedPost);
    });

    it('does not increment viewCount for draft posts', async () => {
      prisma.post.findUnique.mockResolvedValue(draftPost);

      const result = await service.findOne('post-1');

      expect(prisma.post.update).not.toHaveBeenCalled();
      expect(result).toEqual(draftPost);
    });
  });
});

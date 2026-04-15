import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostModel } from 'generated/client/models/Post';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Role } from '../common/enums/role.enum';
import slugify from 'slugify';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) {}

    async findAll(): Promise<PostModel[]> {
        return this.prisma.post.findMany({
            where: { status: 'PUBLISHED' },
            include: { user: { select: { firstName: true, lastName: true } } }
        });
    }

    async findOne(id: string) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }
        
    async create(data: CreatePostDto, userId: string): Promise<PostModel> {
        const { title, thumbnail, content, status } = data;
        const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
        return this.prisma.post.create({
            data: {
                authorId: userId,
                title,
                slug,
                thumbnail,
                content,
                status,
            } 
        });
    }

    async update(id: string, data: UpdatePostDto, userId: string, userRole: Role): Promise<PostModel> {
        const post = await this.findOne(id);
        if(post.authorId !== userId && userRole !== Role.ADMIN){
            throw new ForbiddenException('You are not allowed to update this post');
        }

        const { title, thumbnail, content, status } = data;


        return this.prisma.post.update({
            where: { id },
            data: {
                title,
                thumbnail,
                content,
                status,
            }
        });
    }

    async delete(id: string, userId: string, userRole: Role): Promise<void> {
        const post = await this.findOne(id);
        if (post.authorId !== userId && userRole !== Role.ADMIN) {
            throw new ForbiddenException('You are not allowed to delete this post');
        }
        await this.prisma.post.delete({
            where: { id }
        });
    }
}

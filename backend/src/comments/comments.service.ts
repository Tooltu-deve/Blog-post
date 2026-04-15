import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentModel } from 'generated/client/models/Comment';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) {}

    async create (data: CreateCommentDto, userId: string): Promise<CommentModel> {
        const { content, postId } = data;
        
        const comment = await this.prisma.comment.create({
            data: {
                content,
                postId,
                authorId: userId,
            }
        });
        return comment;
    }

    async findAll(postId: string): Promise<CommentModel[]> {
        return this.prisma.comment.findMany({
            where: { postId },
            include: {
                author:{
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });
    }

    async delete(id: string, userId: string, userRole: Role): Promise<void> {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        if (comment.authorId !== userId && userRole !== Role.ADMIN) {
            throw new ForbiddenException('You are not allowed to delete this comment');
        }
        await this.prisma.comment.delete({
            where: { id },
        });
    }

}

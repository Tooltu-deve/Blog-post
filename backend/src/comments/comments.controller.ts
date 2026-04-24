import { Controller, Post, Body, Req, Param, Get, Delete, UseGuards, Query } from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import { Comment } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CognitoJwtGuard } from '../auth/cognito-jwt.guard.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}


    @UseGuards(CognitoJwtGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createCommentDto: CreateCommentDto, @Req() req): Promise<Comment> {
        return this.commentsService.create(createCommentDto, req.user.id);
    }

    @Get()
    async findAll(@Query('postId') postId: string): Promise<Comment[]> {
        return this.commentsService.findAll(postId);
    }


    @UseGuards(CognitoJwtGuard)
    @ApiBearerAuth()
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req): Promise<void> {
        return this.commentsService.delete(id, req.user.id, req.user.role);
    }
}

import { Controller, Post, Body, Req, Param, Get, Delete, UseGuards, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentModel } from 'generated/client/models/Comment';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}


    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createCommentDto: CreateCommentDto, @Req() req): Promise<CommentModel> {
        return this.commentsService.create(createCommentDto, req.user.id);
    }

    @Get()
    async findAll(@Query('postId') postId: string): Promise<CommentModel[]> {
        return this.commentsService.findAll(postId);
    }


    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req): Promise<void> {
        return this.commentsService.delete(id, req.user.id, req.user.role);
    }
}

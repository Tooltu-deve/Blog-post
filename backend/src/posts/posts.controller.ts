import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { CognitoJwtGuard, OptionalCognitoJwtGuard } from '../auth/cognito-jwt.guard.js';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @UseGuards(OptionalCognitoJwtGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.postsService.findOne(id, req.user?.id);
  }

  @Post()
  @UseGuards(CognitoJwtGuard)          // 1. Decorator để apply guard
  @ApiBearerAuth()
  create(@Body() dto: CreatePostDto, @Request() req) {
    return this.postsService.create(dto, req.user.id);  // 2. field userId trong JWT payload
  }

  @Patch(':id')
  @UseGuards(CognitoJwtGuard)          // 3. Guard
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Request() req) {
    return this.postsService.update(id, dto, req.user.id, req.user.role);  // 4 & 5. userId, userRole
  }

  @Delete(':id')
  @UseGuards(CognitoJwtGuard)          // 6. Guard
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.delete(id, req.user.id, req.user.role);
  }
}
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";
import { Status } from '@prisma/client';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsUrl()
    @IsOptional()
    thumbnail?: string;

    @IsEnum(Status)
    @IsOptional()
    status?: Status;
}
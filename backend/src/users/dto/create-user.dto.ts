import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';


export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(32)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(32)
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    password: string;
}
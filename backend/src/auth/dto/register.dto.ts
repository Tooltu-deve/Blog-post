import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { LoginDto } from "./login.dto";


export class RegisterDto extends LoginDto {
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
}
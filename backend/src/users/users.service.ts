import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserModel } from '../../generated/client/models/User';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';



@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findByEmail(email: string): Promise<UserModel | null> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        return user;
    }


    async create(data: CreateUserDto): Promise<UserModel> {
        const { firstName, lastName, email, password } = data;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if(existingUser){
            throw new BadRequestException('User with this email already exists');
        }

        const hashPassword = await bcrypt.hash(password, 12);

        try {
            const user = await this.prisma.user.create({
                data:{
                    email,
                    password: hashPassword,
                    firstName,
                    lastName,
                },
            });
            return user;
        } catch (error) {
            throw new BadRequestException('Failed to create user');
        }
    }
}

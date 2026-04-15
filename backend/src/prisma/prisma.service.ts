import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private configService: ConfigService) {
        const connectionString =
            configService.get<string>('DATABASE_URL') ?? process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error(
                'DATABASE_URL is missing. Set it in backend/.env (or environment) before starting the API.',
            );
        }
        const adapter = new PrismaPg({ connectionString });
        super({ adapter });
    }
    

    async onModuleInit() {
        console.log('PrismaService initialized');
        await this.$connect();
    }

    async onModuleDestroy() {
        console.log('PrismaService destroyed');
        await this.$disconnect();
    }
}

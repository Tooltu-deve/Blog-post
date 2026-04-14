import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private configService: ConfigService) {
        const adapter = new PrismaPg({
          connectionString: configService.get<string>('DATABASE_URL'),
        });
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

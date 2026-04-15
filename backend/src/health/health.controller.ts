import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Health check dùng Prisma + PostgreSQL (driver adapter).
 * PrismaHealthIndicator của @nestjs/terminus gọi $runCommandRaw({ ping: 1 }) — API Mongo —
 * nên không dùng được với Postgres; ping DB bằng SELECT 1.
 */
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };
    } catch {
      return {
        status: 'error',
        info: {},
        error: { database: { status: 'down' } },
        details: { database: { status: 'down' } },
      };
    }
  }
}

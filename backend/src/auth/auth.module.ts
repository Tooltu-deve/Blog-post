import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CognitoJwtStrategy } from './strategies/cognito-jwt.strategy.js';
import { UserProvisioningService } from './user-provisioning.service.js';
import { UsersModule } from '../users/users.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PassportModule, UsersModule, PrismaModule],
  providers: [CognitoJwtStrategy, UserProvisioningService],
  exports: [UserProvisioningService],
})
export class AuthModule {}

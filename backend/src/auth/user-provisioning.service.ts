import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { User } from '@prisma/client';

export interface CognitoClaims {
  cognitoSub: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class UserProvisioningService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find-or-create a User row keyed by Cognito sub.
   *
   * First request from a given Cognito identity creates the row.
   * Subsequent requests return the existing row. Email/name updates
   * from Cognito are applied on every call (idempotent upsert).
   */
  async ensureUser(claims: CognitoClaims): Promise<User> {
    const { cognitoSub, email, firstName, lastName } = claims;

    const existing = await this.prisma.user.findUnique({
      where: { cognitoSub },
    });

    if (existing) {
      // Keep email/name in sync with Cognito when claims are present
      if (email && email !== existing.email) {
        return this.prisma.user.update({
          where: { cognitoSub },
          data: { email },
        });
      }
      return existing;
    }

    // First-time provisioning — email is required at account creation in Cognito,
    // so it should always be present on the first request (via ID token).
    if (!email) {
      // Access token without email claim on a brand-new user — rare edge case.
      // Fall back to a deterministic placeholder so the row exists; next ID-token
      // call will overwrite with the real email.
      return this.prisma.user.create({
        data: {
          cognitoSub,
          email: `${cognitoSub}@pending.cognito`,
          firstName: firstName ?? '',
          lastName: lastName ?? '',
        },
      });
    }

    return this.prisma.user.create({
      data: {
        cognitoSub,
        email,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
      },
    });
  }
}

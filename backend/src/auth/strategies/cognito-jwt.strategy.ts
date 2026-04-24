import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UserProvisioningService } from '../user-provisioning.service.js';

export interface CognitoJwtPayload {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  'cognito:username'?: string;
  'cognito:groups'?: string[];
  token_use: 'id' | 'access';
  iss: string;
  aud?: string;
  client_id?: string;
}

@Injectable()
export class CognitoJwtStrategy extends PassportStrategy(Strategy, 'cognito-jwt') {
  constructor(
    private configService: ConfigService,
    private userProvisioning: UserProvisioningService,
  ) {
    const region = configService.get<string>('COGNITO_REGION');
    const userPoolId = configService.get<string>('COGNITO_USER_POOL_ID');
    const clientId = configService.get<string>('COGNITO_CLIENT_ID');

    if (!region || !userPoolId || !clientId) {
      throw new Error('COGNITO_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID must be set');
    }

    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer,
      algorithms: ['RS256'],
      // Cognito publishes RSA JWKS here; jwks-rsa fetches + caches
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${issuer}/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: CognitoJwtPayload) {
    // Accept both ID and Access tokens. ID tokens carry email/given_name;
    // Access tokens carry only sub + username. For API auth, access token is canonical.
    if (payload.token_use !== 'id' && payload.token_use !== 'access') {
      throw new UnauthorizedException('Invalid token_use claim');
    }

    // Ensure a User row exists in our DB for this Cognito identity.
    // For access tokens we may lack email/name — provisioning tolerates partial claims.
    const user = await this.userProvisioning.ensureUser({
      cognitoSub: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
    });

    return {
      id: user.id,
      cognitoSub: payload.sub,
      email: user.email,
      role: user.role,
    };
  }
}

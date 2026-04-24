import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CognitoJwtGuard extends AuthGuard('cognito-jwt') {}

@Injectable()
export class OptionalCognitoJwtGuard extends AuthGuard('cognito-jwt') {
  handleRequest(err: any, user: any) {
    return user || null;
  }
}

import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {}

export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    return user;
  }
}

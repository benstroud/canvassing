import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { Request } from 'express';

async function jwtVerify(request: any, jwtService: JwtService) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const token = extractTokenFromHeader(request);
  if (!token) {
    throw new UnauthorizedException();
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = await jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    });

    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    request['user'] = payload;
  } catch {
    throw new UnauthorizedException();
  }
}

function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    await jwtVerify(request, this.jwtService);
    return true;
  }
}

// Allows the use of JwtAuthGuard in GraphQL resolvers.
@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await jwtVerify(ctx.getContext().req, this.jwtService);
    return true;
  }
}

// To get the current authenticated user in your graphql resolver, use the
// @CurrentUser() decorator.
export const GqlCurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return ctx.getContext().req.user.sub;
  },
);

export const RESTCurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return request.user.sub;
  },
);

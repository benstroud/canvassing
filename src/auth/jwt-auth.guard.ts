// This file contains the AuthGuard, which is a custom guard that will be
// used to protect routes in our application. The guard will verify the JWT
// token in the Authorization header and attach the user object to the request
// if the token is valid. The GqlAuthGuard is a guard that can be used in
// GraphQL resolvers to protect them in the same way as the AuthGuard. The
// GqlCurrentUserId and RESTCurrentUserId decorators can be used to get the
// current authenticated user in GraphQL resolvers and REST controllers,
// respectively.
// See https://docs.nestjs.com/security/authentication

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

// Verifies the JWT token in the Authorization header and sets the request.user
// object.
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

    // We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    request['user'] = payload;
  } catch {
    throw new UnauthorizedException();
  }
}

// Parses the JWT token from the Authorization header.
function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

// JWT token verification in the context of REST requests.
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

// JWT token verification in the context of GraphQL requests.
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

// To get the current authenticated user in your REST controller, use the
// @RESTCurrentUserId() decorator.
export const RESTCurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return request.user.sub;
  },
);

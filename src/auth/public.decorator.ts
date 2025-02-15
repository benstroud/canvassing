// Provides the @Public() decorator to allow public access to routes. This is
// useful since we've configured app.modules.ts to use the JwtAuthGuard globally
// as default.
// See https://docs.nestjs.com/recipes/passport#enable-authentication-globally

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

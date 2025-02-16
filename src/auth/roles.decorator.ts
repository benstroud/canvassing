// With this in place, we can create a @Roles() decorator. This decorator allows
// specifying what roles are required to access specific resources.

import { SetMetadata } from '@nestjs/common';
import { UserRole, ROLES_KEY } from 'src/constants';

/**
 * A decorator that assigns roles to a route handler or controller.
 *
 * This decorator uses the `SetMetadata` function to attach the specified roles
 * to the metadata of the target. The roles can then be used by guards or other
 * mechanisms to enforce access control.
 *
 * @param roles - A list of roles that are allowed to access the route or controller.
 * @returns A decorator function that sets the roles metadata.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

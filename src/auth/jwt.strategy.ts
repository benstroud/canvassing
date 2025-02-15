import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Obtains the JWT from the Authorization header of the request.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Delegates the responsibility of ensuring that a JWT has not expired to
      // the Passport module. This means that if our route is supplied with an
      // expired JWT, the request will be denied and a 401 Unauthorized response
      // sent. Passport conveniently handles this automatically for us.
      ignoreExpiration: false,
      // The secret key that was used to sign our JWTs. From doc
      // (https://docs.nestjs.com/recipes/passport#implement-protected-route-and-jwt-strategy-guards),
      // "Other options, such as a PEM-encoded public key, may be more
      // appropriate for production apps (see
      // https://github.com/mikenicholson/passport-jwt#configure-strategy). In
      // any case, as cautioned earlier, do not expose this secret publicly."
      secretOrKey: jwtConstants.secret,
    });
  }

  // From doc, "...As a result of all this, our response to the validate() callback
  // is trivial: we simply return an object containing the userId and username
  // properties. Recall again that Passport will build a user object based on
  // the return value of our validate() method, and attach it as a property on
  // the Request object. Additionally, you can return an array, where the first
  // value is used to create a user object and the second value is used to
  // create an authInfo object. It's also worth pointing out that this approach
  // leaves us room ('hooks' as it were) to inject other business logic into the
  // process. For example, we could do a database lookup in our validate()
  // method to extract more information about the user, resulting in a more
  // enriched user object being available in our Request. This is also the place
  // we may decide to do further token validation, such as looking up the userId
  // in a list of revoked tokens, enabling us to perform token revocation. The
  // model we've implemented here in our sample code is a fast, "stateless JWT"
  // model, where each API call is immediately authorized based on the presence
  // of a valid JWT, and a small bit of information about the requester (its
  // userId and username) is available in our Request pipeline."
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return { userId: payload.sub, username: payload.username };
  }
}

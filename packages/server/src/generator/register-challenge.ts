import { createChallenge } from '../utils/crypto'
import { RegistrationOptions, RegistrationChallenge } from '../typed/webauthn'
import { clean } from '../utils/object'
import base64url from 'base64url'

export default function generateRegistrationChallenge ({ rp, user, attestation, authenticator, userVerification, challengeSize = 32 }: RegistrationOptions): RegistrationChallenge {
  if (!rp || !rp.name || typeof rp.name !== 'string')
    throw new Error('The typeof rp.name should be a string')

  if (!user || !user.id || !user.name || typeof user.id !== 'string' || typeof user.name !== 'string')
    throw new Error('The user should have an id (string) and a name (string)')

  if (!authenticator || !(['cross-platform', 'platform'].includes(authenticator)))
    authenticator = 'cross-platform'

  // eslint-disable-next-line array-bracket-newline, array-element-newline
  if (!attestation || !(['none', 'direct', 'indirect'].includes(attestation)))
    attestation = 'direct'

  // eslint-disable-next-line array-bracket-newline, array-element-newline
  if (!userVerification || !(['discouraged', 'preferred', 'required'].includes(userVerification)))
    userVerification = 'discouraged'

  return clean({
    challenge: createChallenge(challengeSize),
    timeout  : 60000,
    rp       : rp,
    user     : {
      id         : base64url.encode(user.id),
      name       : user.name,
      displayName: user.displayName ?? user.name,
    },
    attestation     : attestation,
    pubKeyCredParams: [
      {
        type: 'public-key',
        alg : -7, // "ES256" IANA COSE Algorithms registry
      },
      {
        type: 'public-key',
        alg : -257, // "RS256" IANA COSE Algorithms registry
      },
    ],
    authenticatorSelection: {
      authenticatorAttachment: authenticator,
      userVerification       : userVerification,
    },
  } as RegistrationChallenge)
}

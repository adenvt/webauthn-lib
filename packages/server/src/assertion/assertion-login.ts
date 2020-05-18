import { UserPubKey } from '../typed/webauthn'
import base64url from 'base64url'
import parseAuthData from '../parser/parse-auth-data'
import {
  hash,
  verifySignature,
} from '../utils/crypto'

export default function assertionLogin (authDataJSON: string, signatureJSON: string, clientDataJSON: string, credentials: UserPubKey[]): UserPubKey {
  const clientDataHash = hash('sha256', base64url.toBuffer(clientDataJSON))
  const signature      = base64url.toBuffer(signatureJSON)
  const authDataBuffer = base64url.toBuffer(authDataJSON)
  const authData       = parseAuthData(authDataBuffer)
  const signatureBase  = Buffer.concat([authDataBuffer, clientDataHash])

  const credential = credentials.find((credential) => {
    /**
     * verify that sig is a valid signature over the binary concatenation of
     * authData and hash.
     */
    const publicKey = credential.publicKey
    const verified  = verifySignature(signature, signatureBase, publicKey)

    if (!verified)
      return false

    /**
     * If the signature counter value authData.signCount is zero or the value
     * stored in conjunction with credential’s id attribute is zero,
     * Authenticator not support counter function
     */
    /* istanbul ignore next */
    if (authData.signCount === 0 && credential.counter === 0)
      return true

    return (authData.signCount > credential.counter)
  })

  if (!credential)
    throw new Error('Failed to verify Login Signature')

  return {
    ...credential,
    counter: authData.signCount,
  }
}

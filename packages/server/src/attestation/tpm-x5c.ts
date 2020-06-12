import { NoneAttestationObject } from '../typed/attestation'
import { UserPubKey } from '../typed/webauthn'
import parseAuthData from '../parser/parse-auth-data'
import base64url from 'base64url'
import { COSEtoPEM } from '../utils/crypto'

export default function verifyTPMX5C (attsObject: NoneAttestationObject, _clientDataJSON: string): UserPubKey {
  const authData = parseAuthData(attsObject.authData)

  /* istanbul ignore if */
  if (!authData.attestedCredentialData)
    throw new Error('authData must property attestedCredentialData')

  const credentialId = authData.attestedCredentialData.credentialId
  const publicKey    = COSEtoPEM(authData.attestedCredentialData.credentialPublicKey)

  return {
    fmt         : 'none',
    publicKey   : publicKey,
    counter     : authData.signCount,
    credentialId: base64url.encode(credentialId),
  }
}

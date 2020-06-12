import base64url from 'base64url'
import parseAuthData from '../parser/parse-auth-data'
import { UserPubKey } from '../typed/webauthn'
import { PackedSelfAttestationObject } from '../typed/attestation'
import {
  hash,
  verifySignature,
  COSEtoPEM,
} from '../utils/crypto'

export default function verifyPackedSelf (attsObject: PackedSelfAttestationObject, clientDataJSON: string): UserPubKey {
  const authData = parseAuthData(attsObject.authData)

  /* istanbul ignore if */
  if (!authData.attestedCredentialData)
    throw new Error('authData must property attestedCredentialData')

  const credentialId   = authData.attestedCredentialData.credentialId
  const PEMCertificate = COSEtoPEM(authData.attestedCredentialData.credentialPublicKey)

  const alg       = attsObject.attStmt.alg
  const signature = attsObject.attStmt.sig

  /* istanbul ignore if */
  if (alg !== -7)
    throw new Error('Unsupported Attestation Signature algorithm, only support ES256')

  const clientDataHash = hash('SHA256', base64url.toBuffer(clientDataJSON))
  const signatureBase  = Buffer.concat([attsObject.authData, clientDataHash])
  const verified       = verifySignature(signature, signatureBase, PEMCertificate)

  /* istanbul ignore if */
  if (!verified)
    throw new Error('Failed to verify Attestation Signature')

  return {
    fmt         : 'packed',
    publicKey   : PEMCertificate,
    counter     : authData.signCount,
    credentialId: base64url.encode(credentialId),
  }
}

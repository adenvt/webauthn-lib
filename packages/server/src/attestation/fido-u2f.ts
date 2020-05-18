import { FidoU2FAttestationObject } from '../typed/attestation'
import parseAuthData from '../parser/parse-auth-data'
import base64url from 'base64url'
import { UserPubKey } from '../typed/webauthn'
import COSEtoJWK from 'cose-to-jwk'
import {
  hash,
  verifySignature,
  DERtoPEM,
  JWKtoPEM,
} from '../utils/crypto'

export default function verifyFidoU2FAttestation (attsObject: FidoU2FAttestationObject, clientDataJSON: string): UserPubKey {
  const authData = parseAuthData(attsObject.authData)

  /* istanbul ignore if */
  if (!authData.attestedCredentialData)
    throw new Error('authData must have property attestedCredentialData')

  const rpIdHash       = authData.rpIdHash
  const credentialId   = authData.attestedCredentialData.credentialId
  const clientDataHash = hash('SHA256', base64url.toBuffer(clientDataJSON))
  const pubKeyJWK      = COSEtoJWK(authData.attestedCredentialData.credentialPublicKey)

  /**
   * If certificate public key is not an Elliptic Curve (EC) public key over the
   * P-256 curve, terminate this algorithm and return an appropriate error.
   */
  /* istanbul ignore if */
  if (pubKeyJWK.kty !== 'EC' || pubKeyJWK.crv !== 'P-256')
    throw new Error('Public Key must be Elliptic Curve (EC) over P-256 curve')

  /* istanbul ignore if */
  if (!pubKeyJWK.x || !pubKeyJWK.y)
    throw new Error('Public Key must be contains "x" and "y"')

  const publicKeyU2F = Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(pubKeyJWK.x, 'base64'),
    Buffer.from(pubKeyJWK.y, 'base64'),
  ])

  /**
   * Let verificationData be the concatenation of
   * (0x00 || rpIdHash || clientDataHash || credentialId || publicKeyU2F)
   */
  const signatureBase = Buffer.concat([
    Buffer.from([0x00]), // Reserved Bytes
    rpIdHash,
    clientDataHash,
    credentialId,
    publicKeyU2F,
  ])

  const PEMCertificate = DERtoPEM(attsObject.attStmt.x5c[0])
  const signature      = attsObject.attStmt.sig
  const verified       = verifySignature(signature, signatureBase, PEMCertificate)

  /* istanbul ignore if */
  if (!verified)
    throw new Error('Failed to verify Attestation Signature')

  return {
    fmt         : 'fido-u2f',
    counter     : authData.signCount,
    credentialId: base64url.encode(credentialId),
    publicKey   : JWKtoPEM(pubKeyJWK),
  }
}

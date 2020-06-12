import base64url from 'base64url'
import parseAuthData from '../parser/parse-auth-data'
import { UserPubKey } from '../typed/webauthn'
import { AndroidKeyAttestationObject } from '../typed/attestation'
import { Certificate, Extension } from '@fidm/x509'
import { ASN1hasTag, ASN1parse } from '../utils/asn1'
import {
  hash,
  verifySignature,
  DERtoPEM,
  verifyCertPath,
  COSEtoPEM,
} from '../utils/crypto'

export default function verifyAndroidKeyAttestation (attsObject: AndroidKeyAttestationObject, clientDataJSON: string): UserPubKey {
  const authData = parseAuthData(attsObject.authData)

  /* istanbul ignore if */
  if (!authData.attestedCredentialData)
    throw new Error('authData must property attestedCredentialData')

  const credentialId = authData.attestedCredentialData.credentialId
  const certificates = (attsObject.attStmt.x5c)
    .map((cert) => DERtoPEM(cert))

  /**
  * Verify Certificate Chain
  */
  /* istanbul ignore if */
  if (verifyCertPath(certificates) !== true)
    throw new Error('Failed to verify Certificate Path')

  /**
   * Verify that sig is a valid signature over the concatenation of
   * authenticatorData and clientDataHash using the attestation public key in
   * attestnCert with the algorithm specified in alg.
   */
  const PEMCertificate = certificates[0]
  const signature      = attsObject.attStmt.sig
  const clientDataHash = hash('SHA256', base64url.toBuffer(clientDataJSON))
  const signatureBase  = Buffer.concat([attsObject.authData, clientDataHash])
  const verified       = verifySignature(signature, signatureBase, PEMCertificate)

  /* istanbul ignore if */
  if (!verified)
    throw new Error('Failed to verify Attestation Signature')

  /**
   * Verify that the public key in the first certificate in x5c matches
   * the credentialPublicKey in the attestedCredentialData in authenticatorData.
   */
  const attestationCert = Certificate.fromPEM(Buffer.from(PEMCertificate))
  const authPubKey      = COSEtoPEM(authData.attestedCredentialData.credentialPublicKey)
  const certPubKey      = attestationCert.publicKey.toPEM()

  /* istanbul ignore if */
  if (authPubKey.trim() !== certPubKey.trim())
    throw new Error('Certificate public key does not match public key in authData')

  const extension     = attestationCert.getExtension('1.3.6.1.4.1.11129.2.1.17') as Extension
  const extensionData = ASN1parse(extension.value)
  const extensionHash = extensionData.data[4].data

  /**
   * Verify that the attestationChallenge field in the attestation certificate
   * extension data is identical to clientDataHash.
   */
  /* istanbul ignore if */
  if (!Buffer.isBuffer(extensionHash) || !extensionHash.equals(clientDataHash))
    throw new Error('Certificate attestation challenge is not set to the clientData hash!')

  /**
   * The AuthorizationList.allApplications field is not present on either
   * authorization list (softwareEnforced nor teeEnforced),
   * since PublicKeyCredential MUST be scoped to the RP ID.
   */
  const softwareEnforced = extensionData.data[6].data
  const teeEnforced      = extensionData.data[7].data

  /* istanbul ignore if */
  if (ASN1hasTag(softwareEnforced, 600) || ASN1hasTag(teeEnforced, 600))
    throw new Error('TEE or Software autherisation cannot contains "allApplication" flag')

  return {
    fmt         : 'android-key',
    counter     : authData.signCount,
    credentialId: base64url.encode(credentialId),
    publicKey   : authPubKey,
  }
}

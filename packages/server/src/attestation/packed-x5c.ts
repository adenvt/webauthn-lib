import base64url from 'base64url'
import { Certificate } from '@fidm/x509'
import parseAuthData from '../parser/parse-auth-data'
import isISO31661Alpha2 from '../utils/iso-3166'
import { UserPubKey } from '../typed/webauthn'
import { PackedX5CAttestationObject } from '../typed/attestation'
import {
  hash,
  verifySignature,
  DERtoPEM,
  COSEtoPEM,
} from '../utils/crypto'

export default function verifyPackedX5C (attsObject: PackedX5CAttestationObject, clientDataJSON: string): UserPubKey {
  const authData = parseAuthData(attsObject.authData)

  /* istanbul ignore if */
  if (!authData.attestedCredentialData)
    throw new Error('authData must property attestedCredentialData')

  const PEMCertificate  = DERtoPEM(attsObject.attStmt.x5c[0])
  const attestationCert = Certificate.fromPEM(Buffer.from(PEMCertificate))
  const subject         = attestationCert.subject

  /**
   * Getting requirements from https://www.w3.org/TR/webauthn/#packed-attestation
   * Version MUST be set to 3 (which is indicated by an ASN.1 INTEGER with value 2).
   */
  /* istanbul ignore if */
  if (attestationCert.version !== 3)
    throw new Error('Version MUST be set to 3 (which is indicated by an ASN.1 INTEGER with value 2)')

  /**
   * Subject-C
   * ISO 3166 code specifying the country where the Authenticator vendor is incorporated (PrintableString)
   */
  /* istanbul ignore if */
  if (!isISO31661Alpha2(subject.countryName))
    throw new Error('Invalid Subject Country, must be valid ISO 3166')

  /**
   * Subject-O
   * Legal name of the Authenticator vendor (UTF8String)
   */
  /* istanbul ignore if */
  if (!subject.organizationName)
    throw new Error('Invalid Subject Organization Name')

  /**
   * Subject-OU
   * Literal string "Authenticator Attestation" (UTF8String)
   */
  /* istanbul ignore if */
  if (subject.organizationalUnitName !== 'Authenticator Attestation')
    throw new Error('Invalid Subject Organizational Unit Name, must be "Authenticator Attestation"')

  /**
   * Subject-CN
   * A UTF8String of the vendor’s choosing
   */
  /* istanbul ignore if */
  if (!subject.commonName)
    throw new Error('Invalid Subject Common Name')

  /**
   * The Basic Constraints extension MUST have the CA component set to false
   */
  /* istanbul ignore if */
  if (attestationCert.isCA !== false)
    throw new Error('Basic Constraints extension MUST have the CA component set to false')

  /**
   * If the related attestation root certificate is used for multiple authenticator models,
   * the Extension OID 1.3.6.1.4.1.45724.1.1.4 (id-fido-gen-ce-aaguid) MUST be present,
   * containing the AAGUID as a 16-byte OCTET STRING.
   */
  const aaguidExtension = attestationCert.getExtension('1.3.6.1.4.1.45724.1.1.4')
  /* istanbul ignore if */
  if (aaguidExtension !== null) {
    // AAGUID MUST be wrapped in two OCTET STRINGS
    if (aaguidExtension.value.slice(2).toString('hex') !== authData.attestedCredentialData.aaguid)
      throw new Error('Invalid Extension "id-fido-gen-ce-aaguid" value')

    // The extension MUST NOT be marked as critical.
    if (aaguidExtension.critical !== false)
      throw new Error('Extension "id-fido-gen-ce-aaguid" must not be marked as critical')
  }

  /**
   * Verify that sig is a valid signature over the concatenation of
   * authenticatorData and clientDataHash using the attestation public key in
   * attestnCert with the algorithm specified in alg.
   */
  const signature      = attsObject.attStmt.sig
  const clientDataHash = hash('SHA256', base64url.toBuffer(clientDataJSON))
  const signatureBase  = Buffer.concat([attsObject.authData, clientDataHash])
  const verified       = verifySignature(signature, signatureBase, PEMCertificate)

  /* istanbul ignore if */
  if (!verified)
    throw new Error('Failed to verify Attestation Signature')

  const credentialId = authData.attestedCredentialData.credentialId
  const publicKey    = COSEtoPEM(authData.attestedCredentialData.credentialPublicKey)

  return {
    fmt         : 'packed',
    publicKey   : publicKey,
    counter     : authData.signCount,
    credentialId: base64url.encode(credentialId),
  }
}

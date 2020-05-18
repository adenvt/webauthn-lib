import base64url from 'base64url'
import { AndroidSafetyNetAttestationObject } from '../typed/attestation'
import { Certificate } from '@fidm/x509'
import { UserPubKey } from '../typed/webauthn'
import parseAuthData from '../parser/parse-auth-data'
import {
  hash,
  verifySignature,
  Base64toPEM,
  verifyCertPath,
  COSEtoPEM,
} from '../utils/crypto'

interface SafetyNetPayload {
  readonly timestampMs: number;
  readonly nonce: string;
  readonly apkPackageName: string;
  readonly apkCertificateDigestSha256: string[];
  readonly ctsProfileMatch: boolean;
  readonly basicIntegrity: boolean;
}

const ROOT_CERT = `
-----BEGIN CERTIFICATE-----
MIIDujCCAqKgAwIBAgILBAAAAAABD4Ym5g0wDQYJKoZIhvcNAQEFBQAwTDEgMB4G
A1UECxMXR2xvYmFsU2lnbiBSb290IENBIC0gUjIxEzARBgNVBAoTCkdsb2JhbFNp
Z24xEzARBgNVBAMTCkdsb2JhbFNpZ24wHhcNMDYxMjE1MDgwMDAwWhcNMjExMjE1
MDgwMDAwWjBMMSAwHgYDVQQLExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMjETMBEG
A1UEChMKR2xvYmFsU2lnbjETMBEGA1UEAxMKR2xvYmFsU2lnbjCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBAKbPJA6+Lm8omUVCxKs+IVSbC9N/hHD6ErPL
v4dfxn+G07IwXNb9rfF73OX4YJYJkhD10FPe+3t+c4isUoh7SqbKSaZeqKeMWhG8
eoLrvozps6yWJQeXSpkqBy+0Hne/ig+1AnwblrjFuTosvNYSuetZfeLQBoZfXklq
tTleiDTsvHgMCJiEbKjNS7SgfQx5TfC4LcshytVsW33hoCmEofnTlEnLJGKRILzd
C9XZzPnqJworc5HGnRusyMvo4KD0L5CLTfuwNhv2GXqF4G3yYROIXJ/gkwpRl4pa
zq+r1feqCapgvdzZX99yqWATXgAByUr6P6TqBwMhAo6CygPCm48CAwEAAaOBnDCB
mTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUm+IH
V2ccHsBqBt5ZtJot39wZhi4wNgYDVR0fBC8wLTAroCmgJ4YlaHR0cDovL2NybC5n
bG9iYWxzaWduLm5ldC9yb290LXIyLmNybDAfBgNVHSMEGDAWgBSb4gdXZxwewGoG
3lm0mi3f3BmGLjANBgkqhkiG9w0BAQUFAAOCAQEAmYFThxxol4aR7OBKuEQLq4Gs
J0/WwbgcQ3izDJr86iw8bmEbTUsp9Z8FHSbBuOmDAGJFtqkIk7mpM0sYmsL4h4hO
291xNBrBVNpGP+DTKqttVCL1OmLNIG+6KYnX3ZHu01yiPqFbQfXf5WRDLenVOavS
ot+3i9DAgBkcRcAtjOj4LaR0VknFBbVPFd5uRHg5h6h+u/N5GJG79G+dwfCMNYxd
AfvDbbnvRG15RjF+Cv6pgsH/76tuIMRQyV+dTZsXjAzlAcmgQWpzU/qlULRuJQ/7
TBj0/VLZjmmx6BEP3ojY+x1J96relc8geMJgEtslQIxq/H5COEBkEveegeGTLg==
-----END CERTIFICATE-----
`

export default function verifyAndroidSafetyNetAttestation (attsObject: AndroidSafetyNetAttestationObject, clientDataJSON: string): UserPubKey {
  const authData = parseAuthData(attsObject.authData)

  /* istanbul ignore if */
  if (!authData.attestedCredentialData)
    throw new Error('authData must property attestedCredentialData')

  const response     = attsObject.attStmt.response.toString('utf-8')
  const jwsResponse  = response.split('.')
  const header       = JSON.parse(base64url.decode(jwsResponse[0]))
  const payload      = JSON.parse(base64url.decode(jwsResponse[1])) as SafetyNetPayload
  const signature    = base64url.toBuffer(jwsResponse[2])
  const certificates = (header.x5c as string[])
    .map((cert) => Base64toPEM(cert))
    .concat([ROOT_CERT])

  /**
  * Verify Certificate Chain
  */
  /* istanbul ignore if */
  if (verifyCertPath(certificates) !== true)
    throw new Error('Failed to verify Certificate Path')

  /**
   * Verify that the nonce in the response is identical to the Base64 encoding
   * of the SHA-256 hash of the concatenation of authenticatorData and clientDataHash.
   */
  const clientDataHash = hash('SHA256', base64url.toBuffer(clientDataJSON))
  const nonceBuffer    = hash('SHA256', Buffer.concat([attsObject.authData, clientDataHash]))
  const nonce          = nonceBuffer.toString('base64')

  /* istanbul ignore if */
  if (payload.nonce !== nonce)
    throw new Error('Failed to verify "nonce" value')

  /**
   * Verify that attestationCert is issued to the hostname "attest.android.com"
   */
  const PEMCertificate  = certificates[0]
  const attestationCert = Certificate.fromPEM(Buffer.from(PEMCertificate))

  /* istanbul ignore if */
  if (attestationCert.subject.commonName !== 'attest.android.com')
    throw new Error('Certificate Subject CN must be "attest.android.com"')

  /**
   * Verify that the ctsProfileMatch attribute in the payload of response is true.
   */
  /* istanbul ignore if */
  if (!payload.ctsProfileMatch)
    throw new Error('Payload.ctsProfileMatch must be true')

  const signatureBase = Buffer.from(`${jwsResponse[0]}.${jwsResponse[1]}`)
  const verified      = verifySignature(signature, signatureBase, PEMCertificate)

  /* istanbul ignore if */
  if (!verified)
    throw new Error('Failed to verify Attestation Signature')

  const credentialId = authData.attestedCredentialData.credentialId
  const publicKey    = COSEtoPEM(authData.attestedCredentialData.credentialPublicKey)

  return {
    fmt         : 'android-safetynet',
    publicKey   : publicKey,
    counter     : authData.signCount,
    credentialId: base64url.encode(credentialId),
  }
}

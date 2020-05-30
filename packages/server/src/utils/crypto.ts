import crypto from 'crypto'
import { Certificate } from '@fidm/x509'
import Rasha from 'rasha'
import Eckles from 'eckles'
import COSEtoJWK from 'cose-to-jwk'
import base64url from 'base64url'

/**
 * Create random bytes challenge
 * @param size size in bytes
 */
export function createChallenge (size = 32): string {
  return base64url.encode(crypto.randomBytes(size))
}

/**
 * Hashing data
 * @param algorithm Hashing algorithm
 * @param data Data to be hash
 */
export function hash (algorithm: string, data: string | Buffer): Buffer {
  return crypto.createHash(algorithm)
    .update(data)
    .digest()
}

/**
 * Verify Signature
 * @param signature Signature
 * @param data Signature Base
 * @param publicKey PEM formated Public Key / Certificate
 */
export function verifySignature (signature: Buffer, data: Buffer, publicKey: string): boolean {
  return crypto.createVerify('sha256')
    .update(data)
    .verify(publicKey, signature)
}

/**
 * Verify Certificate Trust Path
 * @param certificates Array of PEM Certificate
 */
export function verifyCertPath (certificates: string[]): boolean {
  if ((new Set(certificates)).size !== certificates.length)
    throw new Error('Failed to validate certificates path! Dublicate certificates detected!')

  for (let i = 0; i < certificates.length; i++) {
    const subjectPEM  = certificates[i]
    const subjectCert = Certificate.fromPEM(Buffer.from(subjectPEM))
    const issuerPEM   = (i + 1) < certificates.length ? certificates[i + 1] : subjectPEM
    const issuerCert  = Certificate.fromPEM(Buffer.from(issuerPEM))
    const error       = issuerCert.checkSignature(subjectCert)

    if (error !== null)
      throw error
  }

  return true
}

/**
 * Wrap base64 Cert to valid PEM format
 * @param certBase64 Certificate base64 encoded
 * @param type Certificate type, can be "CERTIFICATE" or "PUBLIC KEY"
 */
export function Base64toPEM (certBase64: string, type = 'CERTIFICATE'): string {
  let PEMKey = ''

  // eslint-disable-next-line curly
  for (let i = 0; i < certBase64.length; i += 64) {
    PEMKey += `${certBase64.slice(i, i + 64)}\n`
  }

  return `-----BEGIN ${type}-----\n${PEMKey}-----END ${type}-----\n`
}

/**
 * Convert DER to PEM
 * @param der DER format Public Key or Certificate
 */
export function DERtoPEM (der: Buffer): string {
  return Base64toPEM(der.toString('base64'), 'CERTIFICATE')
}

/**
 * Convert JWK to PEM
 * @param jwk JSON Web Key
 */
export function JWKtoPEM (jwk: JsonWebKey): string {
  if (jwk.kty?.toUpperCase() === 'EC')
    return Eckles.exportSync({ jwk: jwk })

  /* istanbul ignore else */
  if (jwk.kty?.toUpperCase() === 'RSA')
    return Rasha.exportSync({ jwk: jwk })

  /* istanbul ignore next */
  throw new Error(`Cannot support JWK with key type: ${jwk.kty}`)
}

/**
 * Convert COSE to PEM
 * @param COSEPublicKey COSE encoded Buffer
 */
export function COSEtoPEM (COSEPublicKey: Buffer): string {
  return JWKtoPEM(COSEtoJWK(COSEPublicKey))
}

export default {
  createChallenge,
  hash,
  verifySignature,
  verifyCertPath,
  ASN1toPEM: DERtoPEM,
}

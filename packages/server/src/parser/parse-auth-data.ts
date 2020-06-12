import cbor from 'cbor'
import BufferCake from '../utils/buffer-cake'
import {
  AuthenticatorData,
  AuthenticatorDataFlag,
  AttestedCredentialData,
} from '../typed/authenticator-data'

const ATTESTATION_MIN_LENGTH = 16 + 2 + 16 + 77 // aaguid + credIdLen + credId + pk

/**
 * Parsing Authenticator Data
 * @param rawBuffer Raw Authenticator Data from response body or attestaion object
 */
export default function parseAuthData (rawBuffer: Buffer): AuthenticatorData {
  /* istanbul ignore if  */
  if (rawBuffer.byteLength < 37)
    throw new Error('Authenticator Data must be at least 37 bytes long!')

  const buffer = new BufferCake(rawBuffer)

  const rpIdHash = buffer.take(32)
  const flagsInt = buffer.take(1).readInt8(0)
  const counter  = buffer.take(4).readUInt32BE(0)

  /**
   * Bit:
   * 0: User Present (UP)
   * 1: Reserved for future use (RFU1).
   * 2: User Verified (UV)
   * 3: Reserved for future use (RFU2)
   * 4: Reserved for future use (RFU2)
   * 5: Reserved for future use (RFU2)
   * 6: Attested Data (AT)
   * 7: Extension Data (ED)
   */
  const UP    = !!(flagsInt & 0x01) // Test of User Presence
  const UV    = !!(flagsInt & 0x04) // User Verification
  const AT    = !!(flagsInt & 0x40) // Attestation data
  const ED    = !!(flagsInt & 0x80) // Extension data
  const flags = { UP, UV, AT, ED } as AuthenticatorDataFlag // eslint-disable-line object-curly-newline

  /* Attested credential data */
  let attestedCredential: AttestedCredentialData | undefined
  if (AT && buffer.left() >= ATTESTATION_MIN_LENGTH) {
    const aaguidBuffer     = buffer.take(16)
    const credIDLength     = buffer.take(2).readUInt16BE(0)
    const credIDBuffer     = buffer.take(credIDLength)
    const cosePubKeyLength = cbor.decodeFirstSync(buffer.get()).byteLength
    const cosePubKey       = buffer.take(cosePubKeyLength)

    attestedCredential = {
      aaguid             : aaguidBuffer.toString('hex'),
      credentialIdLength : credIDLength,
      credentialId       : credIDBuffer,
      credentialPublicKey: cosePubKey,
    }
  }

  /* Extension if present */
  let extensions: Buffer | undefined
  /* istanbul ignore if  */
  if (ED) {
    const extensionLength = cbor.decodeFirstSync(buffer.get()).byteLength
    const extensionBuffer = buffer.take(extensionLength)

    extensions = extensionBuffer
  }

  return {
    rpIdHash              : rpIdHash,
    signCount             : counter,
    flags                 : flags,
    attestedCredentialData: attestedCredential,
    extensions            : extensions,
  }
}

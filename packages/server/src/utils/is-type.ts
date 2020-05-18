import {
  AttestationObject,
  FidoU2FAttestationObject,
  AndroidKeyAttestationObject,
  AndroidSafetyNetAttestationObject,
  PackedX5CAttestationObject,
  PackedECDAAAttestationObject,
  PackedSelfAttestationObject,
  TPMX5CAttestationObject,
  TPMECDAAAttestationObject,
  NoneAttestationObject,
} from '../typed/attestation'

/**
 * Check attestationObject is FideU2F
 * @param attestationObject Attestation object
 */
export function isFidoU2F (attestationObject: AttestationObject<any>): attestationObject is FidoU2FAttestationObject {
  return attestationObject.fmt === 'fido-u2f'
}

/**
 * Check attestationObject is Android Key
 * @param attestationObject Attestation object
 */
export function isAndroidKey (attestationObject: AttestationObject<any>): attestationObject is AndroidKeyAttestationObject {
  return attestationObject.fmt === 'android-key'
}

/**
 * Check attestationObject is Android SafetyNet
 * @param attestationObject Attestation object
 */
export function isAndroidSafetyNet (attestationObject: AttestationObject<any>): attestationObject is AndroidSafetyNetAttestationObject {
  return attestationObject.fmt === 'android-safetynet'
}

/**
 * Check attestationObject is Packed with X5C
 * @param attestationObject Attestation object
 */
export function isPackedX5C (attestationObject: AttestationObject<any>): attestationObject is PackedX5CAttestationObject {
  return attestationObject.fmt === 'packed'
    && 'x5c' in attestationObject.attStmt
}

/**
 * Check attestationObject is Packed with ECDAA
 * @param attestationObject Attestation object
 */
export function isPackedECDAA (attestationObject: AttestationObject<any>): attestationObject is PackedECDAAAttestationObject {
  return attestationObject.fmt === 'packed'
    && 'ecdaaKeyId' in attestationObject.attStmt
}

/**
 * Check attestationObject is Packed with Self Attestaion
 * @param attestationObject Attestation object
 */
export function isPackedSelf (attestationObject: AttestationObject<any>): attestationObject is PackedSelfAttestationObject {
  return attestationObject.fmt === 'packed'
    && !('x5c' in attestationObject.attStmt)
    && !('ecdaaKeyId' in attestationObject.attStmt)
}

/**
 * Check attestationObject is TPM with X5C
 * @param attestationObject Attestation object
 */
export function isTPMX5C (attestationObject: AttestationObject<any>): attestationObject is TPMX5CAttestationObject {
  return attestationObject.fmt === 'tpm'
    && 'x5c' in attestationObject.attStmt
}

/**
 * Check attestationObject is TPM with ECDAA
 * @param attestationObject Attestation object
 */
export function isTPMECDAA (attestationObject: AttestationObject<any>): attestationObject is TPMECDAAAttestationObject {
  return attestationObject.fmt === 'tpm'
    && 'ecdaaKeyId' in attestationObject.attStmt
}

/**
 * Check attestationObject is None
 * @param attestationObject Attestation object
 */
export function isNone (attestationObject: AttestationObject<any>): attestationObject is NoneAttestationObject {
  return attestationObject.fmt === 'none'
}

export default {
  fidoU2F         : isFidoU2F,
  androidKey      : isAndroidKey,
  androidSafetyNet: isAndroidSafetyNet,
  packedX5C       : isPackedX5C,
  packedECDAA     : isPackedECDAA,
  packedSelf      : isPackedSelf,
  tpmX5C          : isTPMX5C,
  tpmECDAA        : isTPMECDAA,
  none            : isNone,
}

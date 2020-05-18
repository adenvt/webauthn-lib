import is from '../../src/utils/is-type'
import {
  FidoU2FAttestationObject,
  PackedSelfAttestationObject,
  PackedX5CAttestationObject,
  PackedECDAAAttestationObject,
  TPMX5CAttestationObject,
  TPMECDAAAttestationObject,
  AndroidKeyAttestationObject,
  AndroidSafetyNetAttestationObject,
  NoneAttestationObject,
} from '../../src/typed/attestation'

const FidoU2F: FidoU2FAttestationObject = {
  fmt    : 'fido-u2f',
  attStmt: {
    x5c: [],
    sig: Buffer.from('sig'),
  },
  authData: Buffer.from('authData'),
}

const PackedSelf: PackedSelfAttestationObject = {
  fmt    : 'packed',
  attStmt: {
    alg: -7,
    sig: Buffer.from('sig'),
  },
  authData: Buffer.from('authData'),
}

const PackedX5C: PackedX5CAttestationObject = {
  fmt    : 'packed',
  attStmt: {
    alg: -7,
    sig: Buffer.from('sig'),
    x5c: [],
  },
  authData: Buffer.from('authData'),
}

const PackedECDAA: PackedECDAAAttestationObject = {
  fmt    : 'packed',
  attStmt: {
    alg       : -7,
    sig       : Buffer.from('sig'),
    ecdaaKeyId: Buffer.from('ecdaaKeyId'),
  },
  authData: Buffer.from('authData'),
}

const TPMX5C: TPMX5CAttestationObject = {
  fmt    : 'tpm',
  attStmt: {
    ver     : '2.0',
    alg     : -7,
    sig     : Buffer.from('sig'),
    x5c     : [],
    pubArea : Buffer.from('pubArea'),
    certInfo: Buffer.from('certInfo'),
  },
  authData: Buffer.from('authData'),
}

const TPMECDAA: TPMECDAAAttestationObject = {
  fmt    : 'tpm',
  attStmt: {
    ver       : '2.0',
    alg       : -7,
    sig       : Buffer.from('sig'),
    pubArea   : Buffer.from('pubArea'),
    certInfo  : Buffer.from('certInfo'),
    ecdaaKeyId: Buffer.from('ecdaaKeyId'),
  },
  authData: Buffer.from('authData'),
}

const AndroidKey: AndroidKeyAttestationObject = {
  fmt    : 'android-key',
  attStmt: {
    alg: -7,
    sig: Buffer.from('sig'),
    x5c: [],
  },
  authData: Buffer.from('authData'),
}

const AndroidSafetyNet: AndroidSafetyNetAttestationObject = {
  fmt    : 'android-safetynet',
  attStmt: {
    ver     : '2.0',
    response: Buffer.from('response'),
  },
  authData: Buffer.from('authData'),
}

const None: NoneAttestationObject = {
  fmt     : 'none',
  attStmt : {},
  authData: Buffer.from('authData'),
}

test('Is Fido-U2F', () => {
  expect(is.fidoU2F(FidoU2F)).toBe(true)
  expect(is.fidoU2F(PackedSelf)).toBe(false)
})

test('Is Packed Self', () => {
  expect(is.packedSelf(PackedSelf)).toBe(true)
  expect(is.packedSelf(FidoU2F)).toBe(false)
  expect(is.packedSelf(PackedX5C)).toBe(false)
  expect(is.packedSelf(PackedECDAA)).toBe(false)
})

test('Is Packed X5C', () => {
  expect(is.packedX5C(PackedX5C)).toBe(true)
  expect(is.packedX5C(PackedSelf)).toBe(false)
  expect(is.packedX5C(PackedECDAA)).toBe(false)
  expect(is.packedX5C(FidoU2F)).toBe(false)
})

test('Is Packed ECDAA', () => {
  expect(is.packedECDAA(PackedECDAA)).toBe(true)
  expect(is.packedECDAA(PackedX5C)).toBe(false)
  expect(is.packedECDAA(PackedSelf)).toBe(false)
  expect(is.packedECDAA(FidoU2F)).toBe(false)
})

test('Is TPM X5C', () => {
  expect(is.tpmX5C(TPMX5C)).toBe(true)
  expect(is.tpmX5C(TPMECDAA)).toBe(false)
  expect(is.tpmX5C(FidoU2F)).toBe(false)
})

test('Is TPM ECDAA', () => {
  expect(is.tpmECDAA(TPMECDAA)).toBe(true)
  expect(is.tpmECDAA(TPMX5C)).toBe(false)
  expect(is.tpmECDAA(FidoU2F)).toBe(false)
})

test('Is Android Key', () => {
  expect(is.androidKey(AndroidKey)).toBe(true)
  expect(is.androidKey(AndroidSafetyNet)).toBe(false)
})

test('Is Android SafetyNet', () => {
  expect(is.androidSafetyNet(AndroidSafetyNet)).toBe(true)
  expect(is.androidSafetyNet(AndroidKey)).toBe(false)
})

test('Is None', () => {
  expect(is.none(None)).toBe(true)
  expect(is.none(FidoU2F)).toBe(false)
})

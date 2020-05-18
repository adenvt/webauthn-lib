export type AttestationFormat = 'fido-u2f' | 'android-key' | 'android-safetynet' | 'packed' | 'tpm' | 'none'

export interface AttestationObject<T> {
  readonly fmt: AttestationFormat;
  readonly authData: Buffer;
  readonly attStmt: T;
}

export interface FidoU2FStatement {
  readonly sig: Buffer;
  readonly x5c: Buffer[];
}

export interface AndroidSafetyNetStatement {
  readonly ver: string;
  readonly response: Buffer;
}

export interface PackedSelfStatement {
  readonly alg: number;
  readonly sig: Buffer;
}

export interface PackedX5CStatement extends PackedSelfStatement {
  readonly x5c: Buffer[];
}

export interface PackedECDAAStatement extends PackedSelfStatement {
  readonly ecdaaKeyId: Buffer;
}

export interface AndroidKeyStatement {
  readonly alg: number;
  readonly sig: Buffer;
  readonly x5c: Buffer[];
}

export interface TPMStatement {
  readonly ver: string;
  readonly sig: Buffer;
  readonly certInfo: Buffer;
  readonly pubArea: Buffer;
  readonly alg: number;
}

export interface TPMX5CStatement extends TPMStatement {
  readonly x5c: Buffer[];
}

export interface TPMECDAAStatement extends TPMStatement {
  readonly ecdaaKeyId: Buffer;
}

export type NoneStatement = {}

export type FidoU2FAttestationObject = AttestationObject<FidoU2FStatement>

export type AndroidSafetyNetAttestationObject = AttestationObject<AndroidSafetyNetStatement>

export type PackedSelfAttestationObject = AttestationObject<PackedSelfStatement>

export type PackedX5CAttestationObject = AttestationObject<PackedX5CStatement>

export type PackedECDAAAttestationObject = AttestationObject<PackedECDAAStatement>

export type AndroidKeyAttestationObject = AttestationObject<AndroidKeyStatement>

export type TPMX5CAttestationObject = AttestationObject<TPMX5CStatement>

export type TPMECDAAAttestationObject = AttestationObject<TPMECDAAStatement>

export type NoneAttestationObject = AttestationObject<NoneStatement>

import { AttestationFormat } from './attestation'

export interface RpEntity extends PublicKeyCredentialEntity {
  id?: string;
}

export interface UserEntity extends PublicKeyCredentialEntity {
  id: string;
  displayName?: string;
}

export interface RegistrationOptions {
  user: UserEntity;
  rp?: RpEntity;
  attestation?: AttestationConveyancePreference;
  authenticator?: AuthenticatorAttachment;
  challengeSize?: number;
}

export interface RegistrationChallenge {
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  challenge: string;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  rp: RpEntity;
  timeout?: number;
  user: UserEntity;
}

export interface LoginOptions {
  rp?: RpEntity;
  challengeSize?: number;
  allowTransports?: AuthenticatorTransport[];
}

export interface PublicKeyCredentialDescriptor {
  id: string;
  transports?: AuthenticatorTransport[];
  type: PublicKeyCredentialType;
}

export interface LoginChallenge {
  allowCredentials?: PublicKeyCredentialDescriptor[];
  challenge: string;
  extensions?: AuthenticationExtensionsClientInputs;
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}

export interface ResponseCredential<T> {
  readonly rawId: string;
  readonly id: string;
  readonly response: T;
  readonly type: string;
}

interface AuthenticatorResponse {
  readonly clientDataJSON: string;
}

interface AuthenticatorAttestationResponse extends AuthenticatorResponse {
  readonly attestationObject: string;
}

interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
  readonly authenticatorData: string;
  readonly signature: string;
  readonly userHandle: string | null;
}

export type RegistrationRequest = ResponseCredential<AuthenticatorAttestationResponse>
export type LoginRequest = ResponseCredential<AuthenticatorAssertionResponse>

export interface UserPubKey {
  readonly fmt: AttestationFormat;
  readonly publicKey: string;
  readonly counter: number;
  readonly credentialId: string;
}

export interface WebAuthnOption {
  rpOrigin: string;
  rpName?: string;
  rpIcon?: string;
  attestation?: AttestationConveyancePreference;
  authenticator?: AuthenticatorAttachment;
  challengeSize?: number;
  allowTransports?: AuthenticatorTransport[];
}

export interface UserChallenge extends UserEntity {
  challenge: string;
}

export interface WebAuthnChallenge {
  challenge: UserChallenge;
  response: RegistrationChallenge | LoginChallenge;
}

export type CredentialId = string | UserPubKey
export type CredentialIds = CredentialId | CredentialId[]

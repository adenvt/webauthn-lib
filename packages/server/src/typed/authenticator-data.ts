export interface AuthenticatorDataFlag {
  readonly UP: boolean;
  readonly UV: boolean;
  readonly AT: boolean;
  readonly ED: boolean;
}

export interface AttestedCredentialData {
  readonly aaguid: string;
  readonly credentialIdLength: number;
  readonly credentialId: Buffer;
  readonly credentialPublicKey: Buffer;
}

export interface AuthenticatorData {
  readonly rpIdHash: Buffer;
  readonly flags: AuthenticatorDataFlag;
  readonly signCount: number;
  readonly attestedCredentialData?: AttestedCredentialData;
  readonly extensions?: Buffer;
}

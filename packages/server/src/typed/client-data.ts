export interface ClientDataJSON {
  readonly challenge: string;
  readonly origin: string;
  readonly type: 'webauthn.create' | 'webauthn.get';
}

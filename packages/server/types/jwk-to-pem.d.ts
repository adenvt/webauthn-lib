declare module 'jwk-to-pem' {
  export default function JWKtoPEM(object: JsonWebKey, options?: { private: boolean }): string
}

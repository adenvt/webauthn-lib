declare module 'cose-to-jwk' {
  // eslint-disable-next-line unicorn/prevent-abbreviations
  export function algToStr(alg: number): string;

  // eslint-disable-next-line unicorn/prevent-abbreviations
  export function algToHashStr(alg: number): string

  export default function COSEtoJWK(cose: Buffer | ArrayBuffer | Uint8Array): JsonWebKey
}

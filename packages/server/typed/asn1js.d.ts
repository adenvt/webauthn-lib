declare module '@lapo/asn1js' {
  class Stream {
    readonly enc: Buffer;
    readonly pos: number;
  }

  class ASN1Tag {
    readonly tagClass: number;
    readonly tagConstructed: boolean;
    readonly tagNumber: number;

    isUniversal: () => boolean;
    isEOC: () => boolean;
  }

  export default class ASN1 {
    static decode: (stream: Buffer) => ASN1;

    readonly stream: Stream;
    readonly header: number;
    readonly length: number;
    readonly tag: ASN1Tag;
    readonly sub: ASN1[] | null;

    typeName: () => string;
    toString: () => string;
    toPrettyString: (indent?: string) => string;
    posStart: () => number;
    posContent: () => number;
    posEnd: () => number;
    content: (maxLength?: number) => any;
  }
}

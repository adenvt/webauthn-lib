import ASN1 from '@lapo/asn1js'

interface ASN1Object {
  type: string;
  data?: any;
}

/**
 * Convert ASN1 to Object
 * @param asn1 ASN1 Instance
 */
export function ASN1toObject (asn1: ASN1): ASN1Object {
  const result: ASN1Object = { type: asn1.typeName() }

  if (!asn1.sub) {
    if (asn1.typeName() === 'BIT_STRING' || asn1.typeName() === 'OCTET_STRING')
      result.data = asn1.stream.enc.slice(asn1.posContent(), asn1.posEnd())
    else
      result.data = asn1.content()

    return result
  }

  result.data = []

  for (const sub of asn1.sub)
    result.data.push(ASN1toObject(sub))

  return result
}

/**
 * Check Sequence contains tag
 * @param seq ASNObject type SEQUENCE
 * @param tag Tag name
 */
export function ASN1hasTag (seq: ASN1Object[], tag: string | number): boolean {
  for (const member of seq) {
    if (member.type === `[${tag}]`)
      return true
  }

  return false
}

/**
 * Parse raw ASN1 to Object
 * @param stream raw buffer
 */
export function ASN1parse (stream: Buffer): ASN1Object {
  return ASN1toObject(ASN1.decode(stream))
}

export default {
  toObject: ASN1toObject,
  hasTag  : ASN1hasTag,
  parse   : ASN1parse,
}

/**
 * Decode base64
 * @param base64 Base64 encoded string
 */
export function decode (base64: string): string {
  // Convert base64-url to standard base64
  let raw = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  // Pad out with standard base64 required padding characters
  const pad = base64.length % 4

  if (pad) {
    if (pad === 1)
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding')

    raw += new Array(5 - pad).join('=')
  }

  return window.atob(raw)
}

/**
 * Convert base64 to Uint8Array
 * @param base64 Base64 encoded string
 * @internal
 */
export function toUint8 (base64: string): Uint8Array {
  return Uint8Array.from(decode(base64), (c) => c.charCodeAt(0))
}

/**
 * Encode Array Buffer to base64
 * @param buffer Array Buffer
 */
export function encode (buffer: ArrayBuffer): string {
  return window.btoa(String.fromCharCode.apply(undefined, new Uint8Array(buffer) as any))
}

/**
 * Encode all Array Buffer value in object
 * @param object Object
 */
export function encodeObject (object: any): any {
  if (Array.isArray(object))
    return object.map((item) => encodeObject(item))

  if (object instanceof ArrayBuffer)
    return encode(object)

  if (object instanceof Uint8Array)
    return encode(object.buffer)

  if (object instanceof Object) {
    const result: any = {}

    for (const key in object)
      result[key] = encodeObject(object[key])

    return result
  }

  return object
}

export default {
  decode,
  toUint8,
  encode,
  encodeObject,
}

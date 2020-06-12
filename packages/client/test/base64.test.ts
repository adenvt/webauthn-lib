import base64 from '../src/base64'

describe('Encode', () => {
  test('Can convert Array Buffer to base64', () => {
    const input  = 'Hello World'
    const sample = Uint8Array.from(input, (c) => c.charCodeAt(0))
    const output = base64.encode(sample)

    expect(output).toEqual('SGVsbG8gV29ybGQ=')
  })

  test('Can convert Array Buffer in object to base64', () => {
    const sample = {
      name : 'Ade Novid',
      rawId: Uint8Array.from('Hello World', (c) => c.charCodeAt(0)),
      array: [
        {
          credentialId: Uint8Array.from('123456', (c) => c.charCodeAt(0)),
          status      : 200,
        },
        {
          credentialId: Uint8Array.from('654321', (c) => c.charCodeAt(0)),
          status      : 200,
        },
      ],
      data: {
        rawId  : Uint8Array.from('Hello World', (c) => c.charCodeAt(0)).buffer,
        boolean: true,
      },
    }

    const output = base64.encodeObject(sample)
    const target = {
      name : 'Ade Novid',
      rawId: 'SGVsbG8gV29ybGQ=',
      array: [
        {
          credentialId: 'MTIzNDU2',
          status      : 200,
        },
        {
          credentialId: 'NjU0MzIx',
          status      : 200,
        },
      ],
      data: {
        rawId  : 'SGVsbG8gV29ybGQ=',
        boolean: true,
      },
    }

    expect(output).toStrictEqual(target)
  })
})

describe('Decode', () => {
  test('Can decode Base64 string', () => {
    const input  = 'SGVsbG8gV29ybGQ='
    const output = base64.decode(input)

    expect(output).toEqual('Hello World')
  })

  test('Can decode Base64-URL string', () => {
    const input  = 'SGVsbG8gV29ybGQ'
    const output = base64.decode(input)

    expect(output).toEqual('Hello World')
  })

  test('Can decode to Uint8 Array', () => {
    const input  = 'SGVsbG8gV29ybGQ='
    const sample = base64.toUint8(input)

    expect(sample).toBeInstanceOf(Uint8Array)

    const sampleText = Buffer.from(sample).toString('utf-8')
    const expectText = Buffer.from(input, 'base64').toString('utf-8')

    expect(sampleText).toBe(expectText)
    expect(sampleText).toBe('Hello World')
  })

  test('Throw error when input not valid base64', () => {
    expect(() => {
      base64.decode('SGVsbG8gV29yb')
    }).toThrow()

    expect(() => {
      base64.decode('SGVsbG8gV')
    }).toThrowError('InvalidLengthError: Input base64url string is the wrong length to determine padding')
  })
})

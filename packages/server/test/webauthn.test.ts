import WebAuthn from '../src/webauthn'
import loginResponse from './__sample__/login.json'
import registerResponse from './__sample__/register.json'
import noneResponse from './__sample__/none.json'
import androidSafetyNetResponse from './__sample__/android-safetynet.json'
import androidKeyResponse from './__sample__/android-key.json'
import packedX5CResponse from './__sample__/packed-x5c.json'
import packedSelfResponse from './__sample__/packed-self.json'
import tpmX5CResponse from './__sample__/tpm-x5c.json'
import { UserPubKey, LoginOptions } from '../src/typed/webauthn'

jest.mock('../src/utils/crypto')

describe('Webauthn instance', () => {
  test('construtor', () => {
    const instance = new WebAuthn({ rpOrigin: 'http://localhost' })

    expect(instance).toBeInstanceOf(WebAuthn)
    // @ts-ignore
    expect(instance.rp.id).toBe('localhost')
  })

  test('construtor with User Verification true', () => {
    const instance = new WebAuthn({ rpOrigin: 'http://localhost', userVerification: true })

    expect(instance).toBeInstanceOf(WebAuthn)
    // @ts-ignore
    expect(instance.uv).toBe('required')
  })

  test('construtor with User Verification string', () => {
    const instance = new WebAuthn({ rpOrigin: 'http://localhost', userVerification: 'preferred' })

    expect(instance).toBeInstanceOf(WebAuthn)
    // @ts-ignore
    expect(instance.uv).toBe('preferred')
  })

  test('construtor with wrong User Verification ', () => {
    // @ts-ignore
    const instance = new WebAuthn({ rpOrigin: 'http://localhost', userVerification: 'coblagi' })

    expect(instance).toBeInstanceOf(WebAuthn)
    // @ts-ignore
    expect(instance.uv).toBe('discouraged')
  })

  test('construtor without parameter', () => {
    expect(() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new WebAuthn()
    }).toThrowError('Invalid options, options.rpOrigin is required')
  })

  test('construtor with invalid rpOrigin', () => {
    expect(() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new WebAuthn({ rpOrigin: 'www.google.com' })
    }).toThrowError('Invalid options, options.rpOrigin must be valid URL, ex: https://example.com')
  })
})

describe('Generate random ID', () => {
  test('Can generate id', () => {
    const uid = WebAuthn.generateId()

    expect(typeof uid).toBe('string')
    expect(Buffer.from(uid, 'base64').length).toBe(32)
  })
})

describe('Create Register Challenge', () => {
  test('Can generate Register Challenge', () => {
    const webauthn          = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challengeResponse = webauthn.newRegister({ user: { id: 'adenvt@gmail.com', name: 'Ade Novid' } })
    const expectedResponse  = {
      challenge: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE',
      rp       : { id: 'webauthn.io', name: 'webauthn.io' },
      user     : {
        id         : 'YWRlbnZ0QGdtYWlsLmNvbQ',
        name       : 'Ade Novid',
        displayName: 'Ade Novid',
      },
      attestation           : 'direct',
      pubKeyCredParams      : [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      timeout               : 60000,
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        userVerification       : 'discouraged',
      },
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Can generate Regiter Challenge with User Verification true', () => {
    const webauthn          = new WebAuthn({ rpOrigin: 'https://webauthn.io', userVerification: true })
    const challengeResponse = webauthn.newRegister({ user: { id: 'adenvt@gmail.com', name: 'Ade Novid' } })
    const expectedResponse  = {
      challenge: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE',
      rp       : { id: 'webauthn.io', name: 'webauthn.io' },
      user     : {
        id         : 'YWRlbnZ0QGdtYWlsLmNvbQ',
        name       : 'Ade Novid',
        displayName: 'Ade Novid',
      },
      attestation           : 'direct',
      pubKeyCredParams      : [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      timeout               : 60000,
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        userVerification       : 'required',
      },
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Throw error when missing parameter', () => {
    const webauthn = new WebAuthn({ rpOrigin: 'https://webauthn.io' })

    expect(() => {
      // @ts-ignore
      webauthn.newRegister()
    }).toThrowError('Invalid options, options.user is required')
  })
})

describe('Process Register', () => {
  test('Can procress register (None)', () => {
    const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challenge = 'yOTjmSsYdGSIm9vwncvyweuXQBm8vD91PV7-1ga5mvM'
    const result    = webauthn.processRegister(noneResponse, challenge)

    expect(result).toHaveProperty('fmt')
    expect(result).toHaveProperty('counter')
    expect(result).toHaveProperty('publicKey')
    expect(result).toHaveProperty('credentialId')

    expect(result.fmt).toBe('none')
    expect(result).toMatchSnapshot()
  })

  test('Can procress register (Fido U2F)', () => {
    const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challenge = '7LhOEoxKASIyXaOY7_cGDxnE3PDD4pB4elK7PVh9s2Q'
    const result    = webauthn.processRegister(registerResponse, challenge)

    expect(result).toHaveProperty('fmt')
    expect(result).toHaveProperty('counter')
    expect(result).toHaveProperty('publicKey')
    expect(result).toHaveProperty('credentialId')

    expect(result.fmt).toBe('fido-u2f')
    expect(result).toMatchSnapshot()
  })

  test('Can procress register (Android SafetyNet)', () => {
    const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.org' })
    const challenge = 'Tf65bS6D5temh2BwvptqgBPb25iZDRxjwC5ans91IIJDrcrOpnWTK4LVgFjeUV4GDMe44w8SI5NsZssIXTUvDg'
    const result    = webauthn.processRegister(androidSafetyNetResponse, challenge)

    expect(result).toHaveProperty('fmt')
    expect(result).toHaveProperty('counter')
    expect(result).toHaveProperty('publicKey')
    expect(result).toHaveProperty('credentialId')

    expect(result.fmt).toBe('android-safetynet')
    expect(result).toMatchSnapshot()
  })

  test('Can procress register (Android Keystore)', () => {
    const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.org' })
    const challenge = 'Tf65bS6D5temh2BwvptqgBPb25iZDRxjwC5ans91IIJDrcrOpnWTK4LVgFjeUV4GDMe44w8SI5NsZssIXTUvDg'
    const result    = webauthn.processRegister(androidKeyResponse, challenge)

    expect(result).toHaveProperty('fmt')
    expect(result).toHaveProperty('counter')
    expect(result).toHaveProperty('publicKey')
    expect(result).toHaveProperty('credentialId')

    expect(result.fmt).toBe('android-key')
    expect(result).toMatchSnapshot()
  })

  test('Can procress register (Packed X5C)', () => {
    const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challenge = '3xoaHb-E7IXurvjoyaUFv-CQKhLVv9S54-bIqO7FsII'
    const result    = webauthn.processRegister(packedX5CResponse, challenge)

    expect(result).toHaveProperty('fmt')
    expect(result).toHaveProperty('counter')
    expect(result).toHaveProperty('publicKey')
    expect(result).toHaveProperty('credentialId')

    expect(result.fmt).toBe('packed')
    expect(result).toMatchSnapshot()
  })

  test('Can procress register (Packed Self)', () => {
    const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challenge = 'N12mdc327_Ec2IEsSiCNC9u5PTwIGDPRk952qJe_v38'
    const result    = webauthn.processRegister(packedSelfResponse, challenge)

    expect(result).toHaveProperty('fmt')
    expect(result).toHaveProperty('counter')
    expect(result).toHaveProperty('publicKey')
    expect(result).toHaveProperty('credentialId')

    expect(result.fmt).toBe('packed')
    expect(result).toMatchSnapshot()
  })

  test('Throw error when unsupported format', () => {
    expect(() => {
      const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.org' })
      const challenge = 'wk6LqEXAMAZpqcTYlY2yor5DjiyI_b1gy9nDOtCB1yGYnm_4WG4Uk24FAr7AxTOFfQMeigkRxOTLZNrLxCvV_Q'

      webauthn.processRegister(tpmX5CResponse, challenge)
    }).toThrowError('Unsupport Attestation format: tpm')
  })

  test('Throw error when challenge not match', () => {
    expect(() => {
      const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.org' })
      const challenge = 'abcdefghijklmnopqrstuvwxyz'

      webauthn.processRegister(tpmX5CResponse, challenge)
    }).toThrowError('clientDataJSON.challenge not match with expected challenge')
  })

  test('Throw error when origin not match', () => {
    expect(() => {
      const webauthn  = new WebAuthn({ rpOrigin: 'http://localhost' })
      const challenge = 'wk6LqEXAMAZpqcTYlY2yor5DjiyI_b1gy9nDOtCB1yGYnm_4WG4Uk24FAr7AxTOFfQMeigkRxOTLZNrLxCvV_Q'

      webauthn.processRegister(tpmX5CResponse, challenge)
    }).toThrowError("The clientData origin's not match Relying Party's origin")
  })

  test('Throw error when wrong response given', () => {
    expect(() => {
      const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
      const challenge = '7LhOEoxKASIyXaOY7_cGDxnE3PDD4pB4elK7PVh9s2Q'

      webauthn.processRegister(loginResponse, challenge)
    }).toThrowError('Request body is not valid webauthn registration request')
  })

  test('Throw error when UV required but flasg not true', () => {
    expect(() => {
      const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io', userVerification: true })
      const challenge = '7LhOEoxKASIyXaOY7_cGDxnE3PDD4pB4elK7PVh9s2Q'

      webauthn.processRegister(registerResponse, challenge)
    }).toThrowError('User Verification flags must be set true')
  })
})

describe('Create Login Challenge', () => {
  test('Generate challenge without parameter', () => {
    const webauthn          = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challengeResponse = webauthn.newLogin()
    const expectedResponse  = {
      challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE',
      userVerification: 'discouraged',
      timeout         : 60000,
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Generate challenge with string parameter', () => {
    const webauthn          = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challengeResponse = webauthn.newLogin('abcdefh')
    const expectedResponse  = {
      challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE',
      userVerification: 'discouraged',
      allowCredentials: [
        {
          id        : 'abcdefh',
          type      : 'public-key',
          transports: [
            'usb',
            'nfc',
            'ble',
            'internal',
          ],
        },
      ],
      timeout: 60000,
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Generate challenge with array of string parameter', () => {
    const webauthn          = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challengeResponse = webauthn.newLogin(['abcdefh', 'qwerty'])
    const expectedResponse  = {
      challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE',
      userVerification: 'discouraged',
      allowCredentials: [
        {
          id        : 'abcdefh',
          type      : 'public-key',
          transports: [
            'usb',
            'nfc',
            'ble',
            'internal',
          ],
        },
        {
          id        : 'qwerty',
          type      : 'public-key',
          transports: [
            'usb',
            'nfc',
            'ble',
            'internal',
          ],
        },
      ],
      timeout: 60000,
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Generate challenge with UserPubKey parameter', () => {
    const userPubKey = {
      counter     : 0,
      credentialId: 'AVUvAmX241vMKYd7ZBdmkNWaYcNYhoSZCJjFRGmROb6I4ygQUVmH6k9IMwcbZGeAQ4v4WMNphORudwje5h7ty9A',
      fmt         : 'android-key',
      publicKey   : 'BDhJog_eJsNLAIg5GlgneD3_k4gLFlQIiq369XollUmhdDxLUkXPJoXPkQVDZ81Pr7lITnBZNlEBH8DcznYhxo8',
    } as UserPubKey

    const webauthn          = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challengeResponse = webauthn.newLogin(userPubKey)
    const expectedResponse  = {
      challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE',
      userVerification: 'discouraged',
      allowCredentials: [
        {
          id        : 'AVUvAmX241vMKYd7ZBdmkNWaYcNYhoSZCJjFRGmROb6I4ygQUVmH6k9IMwcbZGeAQ4v4WMNphORudwje5h7ty9A',
          type      : 'public-key',
          transports: [
            'usb',
            'nfc',
            'ble',
            'internal',
          ],
        },
      ],
      timeout: 60000,
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Generate challenge with option parameter', () => {
    const userPubKey = {
      counter     : 0,
      credentialId: 'AVUvAmX241vMKYd7ZBdmkNWaYcNYhoSZCJjFRGmROb6I4ygQUVmH6k9IMwcbZGeAQ4v4WMNphORudwje5h7ty9A',
      fmt         : 'android-key',
      publicKey   : 'BDhJog_eJsNLAIg5GlgneD3_k4gLFlQIiq369XollUmhdDxLUkXPJoXPkQVDZ81Pr7lITnBZNlEBH8DcznYhxo8',
    } as UserPubKey

    const options: LoginOptions = { allowTransports: ['internal'], challengeSize: 5 }
    const webauthn              = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challengeResponse     = webauthn.newLogin(userPubKey, options)
    const expectedResponse      = {
      challenge       : 'YWFhYWE',
      userVerification: 'discouraged',
      allowCredentials: [
        {
          id        : 'AVUvAmX241vMKYd7ZBdmkNWaYcNYhoSZCJjFRGmROb6I4ygQUVmH6k9IMwcbZGeAQ4v4WMNphORudwje5h7ty9A',
          type      : 'public-key',
          transports: ['internal'],
        },
      ],
      timeout: 60000,
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Generate challenge with User Verification true', () => {
    const webauthn          = new WebAuthn({ rpOrigin: 'https://webauthn.io', userVerification: true })
    const challengeResponse = webauthn.newLogin()
    const expectedResponse  = {
      challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE',
      userVerification: 'required',
      timeout         : 60000,
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })
})

describe('Process Login', () => {
  test('Can verify login request', () => {
    const credentials: UserPubKey[] = [
      {
        counter     : 0,
        credentialId: 'vZMrqL__-tEDzaXG5tbVFU5JoxtMt6AnPs_OcaZoWM8',
        fmt         : 'fido-u2f',
        publicKey   : [
          '-----BEGIN PUBLIC KEY-----',
          'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAUEWkmz5r7rVHhypZS6zepJKCYud',
          'Kj3+MEkMvg7ud9Y8Vd7g1HNPVoLBr4Nu6eXzhiEcbVIIKZCuvNcd3xJ+uA==',
          '-----END PUBLIC KEY-----',
        ].join('\n'),
      },
      {
        counter     : 0,
        credentialId: 'PTCnTJ9dsa3pZ7nnJe0GdziRPsQV7gQdKDJYevMytoQ',
        fmt         : 'fido-u2f',
        publicKey   : [
          '-----BEGIN PUBLIC KEY-----',
          'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE8ZFjAHxqLjmi+yQnF4c73Q35OSh4',
          'Ju/z7cwBG3sVC0hcJ6v6J02lpVEH+BlI2ggd96Z7J3UldA5F3DQyzyOkUQ==',
          '-----END PUBLIC KEY-----',
        ].join('\n'),
      },
    ]

    const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challenge = 'fgqnwaiAcwNtHB48dSdU__sk7VNSo41fkPHGuM-W_pI'
    const result    = webauthn.processLogin(loginResponse, challenge, credentials)

    const expectResult = {
      fmt         : 'fido-u2f',
      counter     : 2,
      credentialId: 'vZMrqL__-tEDzaXG5tbVFU5JoxtMt6AnPs_OcaZoWM8',
      publicKey   : [
        '-----BEGIN PUBLIC KEY-----',
        'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAUEWkmz5r7rVHhypZS6zepJKCYud',
        'Kj3+MEkMvg7ud9Y8Vd7g1HNPVoLBr4Nu6eXzhiEcbVIIKZCuvNcd3xJ+uA==',
        '-----END PUBLIC KEY-----',
      ].join('\n'),
    }

    expect(result).toStrictEqual(expectResult)
  })

  test('Can verify login request with single credentials', () => {
    const credential: UserPubKey = {
      counter     : 0,
      credentialId: 'vZMrqL__-tEDzaXG5tbVFU5JoxtMt6AnPs_OcaZoWM8',
      fmt         : 'fido-u2f',
      publicKey   : [
        '-----BEGIN PUBLIC KEY-----',
        'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAUEWkmz5r7rVHhypZS6zepJKCYud',
        'Kj3+MEkMvg7ud9Y8Vd7g1HNPVoLBr4Nu6eXzhiEcbVIIKZCuvNcd3xJ+uA==',
        '-----END PUBLIC KEY-----',
      ].join('\n'),
    }

    const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
    const challenge = 'fgqnwaiAcwNtHB48dSdU__sk7VNSo41fkPHGuM-W_pI'
    const result    = webauthn.processLogin(loginResponse, challenge, credential)

    const expectResult = {
      fmt         : 'fido-u2f',
      counter     : 2,
      credentialId: 'vZMrqL__-tEDzaXG5tbVFU5JoxtMt6AnPs_OcaZoWM8',
      publicKey   : [
        '-----BEGIN PUBLIC KEY-----',
        'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAUEWkmz5r7rVHhypZS6zepJKCYud',
        'Kj3+MEkMvg7ud9Y8Vd7g1HNPVoLBr4Nu6eXzhiEcbVIIKZCuvNcd3xJ+uA==',
        '-----END PUBLIC KEY-----',
      ].join('\n'),
    }

    expect(result).toStrictEqual(expectResult)
  })

  test('Throw error when wrong response given', () => {
    expect(() => {
      const credential: UserPubKey = {
        counter     : 0,
        credentialId: 'vZMrqL__-tEDzaXG5tbVFU5JoxtMt6AnPs_OcaZoWM8',
        fmt         : 'fido-u2f',
        publicKey   : [
          '-----BEGIN PUBLIC KEY-----',
          'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAUEWkmz5r7rVHhypZS6zepJKCYud',
          'Kj3+MEkMvg7ud9Y8Vd7g1HNPVoLBr4Nu6eXzhiEcbVIIKZCuvNcd3xJ+uA==',
          '-----END PUBLIC KEY-----',
        ].join('\n'),
      }

      const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io' })
      const challenge = 'fgqnwaiAcwNtHB48dSdU__sk7VNSo41fkPHGuM-W_pI'

      webauthn.processLogin(registerResponse, challenge, credential)
    }).toThrowError('Request body is not valid webauthn login request')
  })

  test('Throw error when User Verification required but flags.uv not true', () => {
    expect(() => {
      const credential: UserPubKey = {
        counter     : 0,
        credentialId: 'vZMrqL__-tEDzaXG5tbVFU5JoxtMt6AnPs_OcaZoWM8',
        fmt         : 'fido-u2f',
        publicKey   : [
          '-----BEGIN PUBLIC KEY-----',
          'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAUEWkmz5r7rVHhypZS6zepJKCYud',
          'Kj3+MEkMvg7ud9Y8Vd7g1HNPVoLBr4Nu6eXzhiEcbVIIKZCuvNcd3xJ+uA==',
          '-----END PUBLIC KEY-----',
        ].join('\n'),
      }

      const webauthn  = new WebAuthn({ rpOrigin: 'https://webauthn.io', userVerification: true })
      const challenge = 'fgqnwaiAcwNtHB48dSdU__sk7VNSo41fkPHGuM-W_pI'

      webauthn.processLogin(loginResponse, challenge, credential)
    }).toThrowError('User Verification flags must be set true')
  })
})

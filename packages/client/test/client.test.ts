import Webuauthn from '../src/client'
import sample from './__sample__/challenge'

describe('Process register challenge', () => {
  test('Can process register challenge & user.id into Uint8Array', () => {
    const challenge = {
      challenge: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=',
      rp       : { id: 'localhost', name: 'Ade Corporate' },
      user     : {
        id         : 'YWRlbnZ0QGdtYWlsLmNvbQ==',
        name       : 'Ade Novid',
        displayName: 'Ade Novid',
      },
      attestation           : 'none',
      pubKeyCredParams      : [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform' },
      timeout               : 60000,
    }

    const output = expect.objectContaining({
      publicKey: {
        challenge: expect.any(Uint8Array),
        rp       : { id: 'localhost', name: 'Ade Corporate' },
        user     : {
          id         : expect.any(Uint8Array),
          name       : 'Ade Novid',
          displayName: 'Ade Novid',
        },
        attestation           : 'none',
        pubKeyCredParams      : [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform' },
        timeout               : 60000,
      },
    })

    Webuauthn.processRegister(challenge)

    expect(navigator.credentials.create).toBeCalledWith(output)
  })

  test('Throw error when response is undefined', () => {
    // @ts-ignore
    const result = Webuauthn.processRegister()

    expect(result).toBeInstanceOf(Promise)
    expect(result).rejects.toThrowError('Response body is not valid webauthn registration challenge')
  })

  test('Throw error when response is wrong', () => {
    // @ts-ignore
    const result = Webuauthn.processRegister(sample.loginChallenge)

    expect(result).toBeInstanceOf(Promise)
    expect(result).rejects.toThrowError('Response body is not valid webauthn registration challenge')
  })
})

describe('Process login challenge', () => {
  test('Can process login challenge into Uint8Array', () => {
    const challenge = {
      challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=',
      userVerification: 'discouraged',
      timeout         : 60000,
    }

    const output = expect.objectContaining({
      publicKey: {
        challenge       : expect.any(Uint8Array),
        userVerification: 'discouraged',
        timeout         : 60000,
      },
    })

    Webuauthn.processLogin(challenge)

    expect(navigator.credentials.get).toBeCalledWith(output)
  })

  test('Can process allowCredentials\'s key.id into Uint8Array', () => {
    const challenge = {
      challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=',
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

    const output = expect.objectContaining({
      publicKey: {
        challenge       : expect.any(Uint8Array),
        userVerification: 'discouraged',
        allowCredentials: [
          {
            id        : expect.any(Uint8Array),
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
      },
    })

    Webuauthn.processLogin(challenge)

    expect(navigator.credentials.get).toBeCalledWith(output)
  })

  test('Throw error when response is undefined', () => {
    // @ts-ignore
    const result = Webuauthn.processLogin()

    expect(result).toBeInstanceOf(Promise)
    expect(result).rejects.toThrowError('Response body is not valid webauthn login challenge')
  })

  test('Throw error when response is wrong', () => {
    // @ts-ignore
    const result = Webuauthn.processLogin(sample.registerChallenge)

    expect(result).toBeInstanceOf(Promise)
    expect(result).rejects.toThrowError('Response body is not valid webauthn login challenge')
  })
})

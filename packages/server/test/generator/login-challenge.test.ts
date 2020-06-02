import generateLoginChallenge from '../../src/generator/login-challenge'
import { UserPubKey, LoginOptions } from '../../src/typed/webauthn'

jest.mock('../../src/utils/crypto')

test('Generate challenge without parameter', () => {
  const challengeResponse = generateLoginChallenge()
  const expectedResponse  = {
    challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE',
    userVerification: 'discouraged',
    timeout         : 60000,
  }

  expect(challengeResponse).toStrictEqual(expectedResponse)
})

test('Generate challenge with string parameter', () => {
  const challengeResponse = generateLoginChallenge('abcdefh')
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
  const challengeResponse = generateLoginChallenge(['abcdefh', 'qwerty'])
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

  const challengeResponse = generateLoginChallenge(userPubKey)
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
  const challengeResponse     = generateLoginChallenge(userPubKey, options)
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

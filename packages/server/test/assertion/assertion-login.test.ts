import loginResponse from '../__sample__/login.json'
import registerResponse from '../__sample__/register.json'
import assertionLogin from '../../src/assertion/assertion-login'
import { UserPubKey } from '../../src/typed/webauthn'
import verifyFidoU2FAttestation from '../../src/attestation/fido-u2f'
import parseAttestationObject from '../../src/parser/parse-attestation-object'

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

  const result = assertionLogin(
    loginResponse.response.authenticatorData,
    loginResponse.response.signature,
    loginResponse.response.clientDataJSON,
    credentials,
  )

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

test('Can verify result of register response', () => {
  const attsObject = parseAttestationObject(registerResponse.response.attestationObject)
  const credential = verifyFidoU2FAttestation(attsObject, registerResponse.response.clientDataJSON)

  const result = assertionLogin(
    loginResponse.response.authenticatorData,
    loginResponse.response.signature,
    loginResponse.response.clientDataJSON,
    [credential],
  )

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

test('Throw error when no credential match', () => {
  expect(() => {
    const credentials: UserPubKey[] = [
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

    assertionLogin(
      loginResponse.response.authenticatorData,
      loginResponse.response.signature,
      loginResponse.response.clientDataJSON,
      credentials,
    )
  }).toThrowError('Failed to verify Login Signature')
})

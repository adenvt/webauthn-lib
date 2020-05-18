import parseAttestationObject from '../../src/parser/parse-attestation-object'
import parseAuthData from '../../src/parser/parse-auth-data'
import attestationResponse from '../__sample__/android-safetynet.json'
import assertionResponse from '../__sample__/assertion.json'

test('Parsing Attestation AuthData', () => {
  const attsObject = parseAttestationObject(attestationResponse.response.attestationObject)
  const authData   = parseAuthData(attsObject.authData)

  expect(authData).toHaveProperty('rpIdHash')
  expect(authData).toHaveProperty('flags')
  expect(authData).toHaveProperty('signCount')
  expect(authData).toHaveProperty('attestedCredentialData')
  expect(authData).toHaveProperty('extensions')

  expect(authData.flags).toHaveProperty('UP')
  expect(authData.flags).toHaveProperty('UV')
  expect(authData.flags).toHaveProperty('AT')
  expect(authData.flags).toHaveProperty('ED')

  expect(authData.attestedCredentialData).toHaveProperty('aaguid')
  expect(authData.attestedCredentialData).toHaveProperty('credentialIdLength')
  expect(authData.attestedCredentialData).toHaveProperty('credentialId')
  expect(authData.attestedCredentialData).toHaveProperty('credentialPublicKey')

  expect(authData.extensions).toBe(undefined)
  expect(authData).toMatchSnapshot()
})

test('Parsing Assertion AuthData', () => {
  const authData = parseAuthData(Buffer.from(assertionResponse.response.authenticatorData))

  expect(authData).toHaveProperty('rpIdHash')
  expect(authData).toHaveProperty('flags')
  expect(authData).toHaveProperty('signCount')
  expect(authData).toHaveProperty('extensions')

  expect(authData.flags).toHaveProperty('UP')
  expect(authData.flags).toHaveProperty('UV')
  expect(authData.flags).toHaveProperty('AT')
  expect(authData.flags).toHaveProperty('ED')

  expect(authData).toMatchSnapshot()
})

test('Throw error when authData less than 37 bytes', () => {
  expect(() => {
    parseAuthData(Buffer.from('hello world'))
  }).toThrowError('Authenticator Data must be at least 37 bytes long!')
})

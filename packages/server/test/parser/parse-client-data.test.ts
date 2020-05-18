import attestationResponse from '../__sample__/register.json'
import assertionResponse from '../__sample__/login.json'
import parseClientData from '../../src/parser/parse-client-data'

test('Parsing Attestation Client Data', () => {
  const clientData = parseClientData(attestationResponse.response.clientDataJSON)

  expect(clientData).toHaveProperty('challenge')
  expect(clientData).toHaveProperty('origin')
  expect(clientData).toHaveProperty('type')

  expect(clientData.type).toBe('webauthn.create')
  expect(clientData).toMatchSnapshot()
})

test('Parsing Assertion Client Data', () => {
  const clientData = parseClientData(assertionResponse.response.clientDataJSON)

  expect(clientData).toHaveProperty('challenge')
  expect(clientData).toHaveProperty('origin')
  expect(clientData).toHaveProperty('type')

  expect(clientData.type).toBe('webauthn.get')
  expect(clientData).toMatchSnapshot()
})

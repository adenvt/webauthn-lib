import attestationResponse from '../__sample__/tpm-x5c.json'
import parseAttestationObject from '../../src/parser/parse-attestation-object'
import verifyTPMX5C from '../../src/attestation/tpm-x5c'
import { NoneAttestationObject } from '../../src/typed/attestation'

test('Verify TPM (X5C)', () => {
  const attsObject = parseAttestationObject(attestationResponse.response.attestationObject) as NoneAttestationObject
  const result     = verifyTPMX5C(attsObject, attestationResponse.response.clientDataJSON)

  expect(result).toHaveProperty('fmt')
  expect(result).toHaveProperty('counter')
  expect(result).toHaveProperty('publicKey')
  expect(result).toHaveProperty('credentialId')

  expect(result).toMatchSnapshot()
})

import attestationResponse from '../__sample__/none.json'
import verifyNoneAttestation from '../../src/attestation/none'
import parseAttestationObject from '../../src/parser/parse-attestation-object'
import { NoneAttestationObject } from '../../src/typed/attestation'

test('Verify FidoU2F', () => {
  const attsObject = parseAttestationObject(attestationResponse.response.attestationObject) as NoneAttestationObject
  const result     = verifyNoneAttestation(attsObject, attestationResponse.response.clientDataJSON)

  expect(result).toHaveProperty('fmt')
  expect(result).toHaveProperty('counter')
  expect(result).toHaveProperty('publicKey')
  expect(result).toHaveProperty('credentialId')

  expect(result).toMatchSnapshot()
})

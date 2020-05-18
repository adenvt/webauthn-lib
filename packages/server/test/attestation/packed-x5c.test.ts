import attestationResponse from '../__sample__/packed-x5c.json'
import parseAttestationObject from '../../src/parser/parse-attestation-object'
import verifyPackedX5C from '../../src/attestation/packed-x5c'
import { PackedX5CAttestationObject } from '../../src/typed/attestation'

test('Verify Packed (x5c)', () => {
  const attsObject = parseAttestationObject(attestationResponse.response.attestationObject) as PackedX5CAttestationObject
  const result     = verifyPackedX5C(attsObject, attestationResponse.response.clientDataJSON)

  expect(result).toHaveProperty('fmt')
  expect(result).toHaveProperty('counter')
  expect(result).toHaveProperty('publicKey')
  expect(result).toHaveProperty('credentialId')

  expect(result).toMatchSnapshot()
})

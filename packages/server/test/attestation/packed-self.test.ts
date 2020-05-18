import attestationResponse from '../__sample__/packed-self.json'
import parseAttestationObject from '../../src/parser/parse-attestation-object'
import verifyPackedSelf from '../../src/attestation/packed-self'
import { PackedSelfAttestationObject } from '../../src/typed/attestation'

test('Verify Packed (Self)', () => {
  const attsObject = parseAttestationObject(attestationResponse.response.attestationObject) as PackedSelfAttestationObject
  const result     = verifyPackedSelf(attsObject, attestationResponse.response.clientDataJSON)

  expect(result).toHaveProperty('fmt')
  expect(result).toHaveProperty('counter')
  expect(result).toHaveProperty('publicKey')
  expect(result).toHaveProperty('credentialId')

  expect(result).toMatchSnapshot()
})

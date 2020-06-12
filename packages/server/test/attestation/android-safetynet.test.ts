import attestationResponse from '../__sample__/android-safetynet.json'
import verifySafetyNetAttestation from '../../src/attestation/android-safetynet'
import parseAttestationObject from '../../src/parser/parse-attestation-object'
import { AndroidSafetyNetAttestationObject } from '../../src/typed/attestation'

test('Verify Android Key', () => {
  const attsObject = parseAttestationObject(attestationResponse.response.attestationObject) as AndroidSafetyNetAttestationObject
  const result     = verifySafetyNetAttestation(attsObject, attestationResponse.response.clientDataJSON)

  expect(result).toHaveProperty('fmt')
  expect(result).toHaveProperty('counter')
  expect(result).toHaveProperty('publicKey')
  expect(result).toHaveProperty('credentialId')

  expect(result).toMatchSnapshot()
})

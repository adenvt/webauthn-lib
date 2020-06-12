import attestationResponse from '../__sample__/android-key.json'
import parseAttestationObject from '../../src/parser/parse-attestation-object'
import verifyAndroidKeyAttestation from '../../src/attestation/android-key'
import { AndroidKeyAttestationObject } from '../../src/typed/attestation'

test('Verify Android Key', () => {
  const attsObject = parseAttestationObject(attestationResponse.response.attestationObject) as AndroidKeyAttestationObject
  const result     = verifyAndroidKeyAttestation(attsObject, attestationResponse.response.clientDataJSON)

  expect(result).toHaveProperty('fmt')
  expect(result).toHaveProperty('counter')
  expect(result).toHaveProperty('publicKey')
  expect(result).toHaveProperty('credentialId')

  expect(result).toMatchSnapshot()
})

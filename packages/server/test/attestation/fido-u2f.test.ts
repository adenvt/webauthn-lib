import attestationResponse from '../__sample__/fido-u2f.json'
import verifyFidoU2FAttestation from '../../src/attestation/fido-u2f'
import parseAttestationObject from '../../src/parser/parse-attestation-object'
import { FidoU2FAttestationObject } from '../../src/typed/attestation'

test('Verify FidoU2F', () => {
  const attsObject = parseAttestationObject(attestationResponse.response.attestationObject) as FidoU2FAttestationObject
  const result     = verifyFidoU2FAttestation(attsObject, attestationResponse.response.clientDataJSON)

  expect(result).toHaveProperty('fmt')
  expect(result).toHaveProperty('counter')
  expect(result).toHaveProperty('publicKey')
  expect(result).toHaveProperty('credentialId')

  expect(result).toMatchSnapshot()
})

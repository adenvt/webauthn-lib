import sampleResponse from '../__sample__/android-safetynet.json'
import parseAttestationObject from '../../src/parser/parse-attestation-object'

test('Parsing Attestation Object', function () {
  const attsObject = parseAttestationObject(sampleResponse.response.attestationObject)

  expect(attsObject).toHaveProperty('fmt')
  expect(attsObject).toHaveProperty('authData')
  expect(attsObject).toHaveProperty('attStmt')

  expect(attsObject).toMatchSnapshot()
})

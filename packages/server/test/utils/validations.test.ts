import attestationResponse from '../__sample__/android-safetynet.json'
import assertionResponse from '../__sample__/assertion.json'
import { validateRegistrationRequest, validateLoginRequest } from '../../src/utils/validations'

test('Validation Register Request', () => {
  expect(validateRegistrationRequest(attestationResponse)).toBe(true)
  expect(validateRegistrationRequest(assertionResponse)).toBe(false)
})

test('Validation Login Request', () => {
  expect(validateLoginRequest(assertionResponse)).toBe(true)
  expect(validateLoginRequest(attestationResponse)).toBe(false)
})

import sample from './__sample__/challenge'
import {
  validateLoginChallenge,
  validateRegisterChallenge,
} from '../src/validations'

describe('Validator challenge', () => {
  test('Can validate register challenge', () => {
    expect(validateRegisterChallenge(sample.registerChallenge)).toBe(true)
    expect(validateRegisterChallenge(sample.loginChallenge)).toBe(false)
    expect(validateRegisterChallenge(sample.loginChallengeFull)).toBe(false)
  })

  test('Can validate login challenge', () => {
    expect(validateLoginChallenge(sample.loginChallenge)).toBe(true)
    expect(validateLoginChallenge(sample.loginChallengeFull)).toBe(true)
    expect(validateLoginChallenge(sample.registerChallenge)).toBe(false)
  })
})

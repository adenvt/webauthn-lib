import sample from './__sample__/challenge'
import {
  toUint8,
  validateLoginChallenge,
  validateRegisterChallenge,
} from '../src/utils'

describe('Convert to Uint8Array', () => {
  test('Can convert base64 to Uint8Array', () => {
    const input  = 'SGVsbG8gV29ybGQ='
    const sample = toUint8(input)

    expect(sample).toBeInstanceOf(Uint8Array)

    const sampleText = Buffer.from(sample).toString('utf-8')
    const expectText = Buffer.from(input, 'base64').toString('utf-8')

    expect(sampleText).toBe(expectText)
    expect(sampleText).toBe('Hello World')
  })
})

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

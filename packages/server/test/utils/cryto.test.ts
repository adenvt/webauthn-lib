import crypto from '../../src/utils/crypto'
import certificates from '../__sample__/cert-chain.json'

describe('Create Challenge', () => {
  test('Can generate random challenge', () => {
    const a = crypto.createChallenge()
    const b = crypto.createChallenge()

    expect(a).not.toEqual(b)
  })

  test('Can generate random challenge with spesific length', () => {
    const challenge = crypto.createChallenge(5)
    const length    = Buffer.from(challenge, 'base64').byteLength

    expect(length).toBe(5)
  })
})

describe('Verify Cert Path', () => {
  test('Can validate cert chain', () => {
    expect(crypto.verifyCertPath(certificates)).toBe(true)
  })

  test('Error if cert chain not valid', () => {
    expect(() => {
      crypto.verifyCertPath(certificates.slice(0, 1))
    }).toThrow()
  })

  test('Error if cert duplicate', () => {
    expect(() => {
      crypto.verifyCertPath([certificates[2], certificates[2]])
    }).toThrowError('Failed to validate certificates path! Dublicate certificates detected!')
  })
})

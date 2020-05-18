import generateRegistrationChallenge from '../../src/generator/register-challenge'

jest.mock('../../src/utils/crypto', () => {
  const originalModule = jest.requireActual('../../src/utils/crypto')

  return {
    ...originalModule,
    createChallenge: jest.fn().mockImplementation((size = 32) => {
      return Buffer.alloc(size, 'a').toString('base64')
    }),
  }
})

describe('Generate Registration Challenge', () => {
  test('Generate Registration Challenge', () => {
    const challengeResponse = generateRegistrationChallenge({
      rp  : { id: 'localhost', name: 'Ade Corporate' },
      user: { id: 'adenvt@gmail.com', name: 'Ade Novid' },
    })

    const expectedResponse = {
      challenge: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=',
      rp       : { id: 'localhost', name: 'Ade Corporate' },
      user     : {
        id         : 'YWRlbnZ0QGdtYWlsLmNvbQ==',
        name       : 'Ade Novid',
        displayName: 'Ade Novid',
      },
      attestation           : 'direct',
      pubKeyCredParams      : [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'cross-platform' },
      timeout               : 60000,
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Generate Registration Challenge: Full parameter', () => {
    const challengeResponse = generateRegistrationChallenge({
      rp           : { id: 'localhost', name: 'Ade Corporate' },
      user         : { id: 'adenvt@gmail.com', name: 'Ade Novid' },
      attestation  : 'none',
      authenticator: 'platform',
    })

    const expectedResponse = {
      challenge: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=',
      rp       : { id: 'localhost', name: 'Ade Corporate' },
      user     : {
        id         : 'YWRlbnZ0QGdtYWlsLmNvbQ==',
        name       : 'Ade Novid',
        displayName: 'Ade Novid',
      },
      attestation           : 'none',
      pubKeyCredParams      : [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform' },
      timeout               : 60000,
    }

    expect(challengeResponse).toStrictEqual(expectedResponse)
  })

  test('Generate Registration Challenge: missing parameter', () => {
    expect(() => {
      // @ts-ignore
      generateRegistrationChallenge()
    }).toThrow()

    expect(() => {
      // @ts-ignore
      generateRegistrationChallenge({})
    }).toThrowError('The typeof rp.name should be a string')

    expect(() => {
      // @ts-ignore
      generateRegistrationChallenge({ rp: { name: 'Ade Corporate' } })
    }).toThrowError('The user should have an id (string) and a name (string)')
  })
})

/* global jest */
const originalModule = jest.requireActual('../crypto')
const base64url      = jest.requireActual('base64url')

export default {
  ...originalModule,
  createChallenge: jest.fn().mockImplementation((size = 32) => {
    return base64url.encode(Buffer.alloc(size, 'a'))
  }),
}

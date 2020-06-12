/* global jest */
const credentials = {
  get   : jest.fn(),
  create: jest.fn(),
}

Object.defineProperty(global.navigator, 'credentials', {
  get () {
    return credentials
  },
})

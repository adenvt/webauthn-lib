/* eslint-disable @typescript-eslint/explicit-function-return-type */
const storage = {}

function get (username) {
  return storage[username]
}

function post (username, data) {
  storage[username] = data
}

function put (username, data) {
  storage[username] = { ...storage[username], data }
}

function has (username) {
  return storage[username] !== undefined
    && storage[username] !== null
}

module.exports = {
  storage,
  get,
  post,
  put,
  has,
}

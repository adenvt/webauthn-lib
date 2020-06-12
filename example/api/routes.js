/* eslint-disable @typescript-eslint/no-var-requires */
const WebAuthn = require('@webauthn-lib/server').default
const UserRepo = require('./user-repository')
const Router   = require('express').Router

const app = Router()
const wal = new WebAuthn({ rpOrigin: 'http://localhost:3000/' })

app.post('/register-challenge', (request, response) => {
  const username = request.body.username

  if (!username) {
    return response
      .writeHead(422, 'Field "username" is required')
      .end()
  }

  if (UserRepo.has(username)) {
    return response
      .writeHead(422, `Username "${username}" already registered`)
      .end()
  }

  const challengeResponse = wal.newRegister({
    user: {
      id  : WebAuthn.generateId(), // generated random id
      name: username,
    },
  })

  request.session.username  = username
  request.session.challenge = challengeResponse.challenge

  response.json(challengeResponse)
})

app.post('/register', (request, response) => {
  const username  = request.session.username
  const challenge = request.session.challenge

  try {
    const pubKey = wal.processRegister(request.body, challenge)

    UserRepo.post(username, pubKey)

    response.json({
      code   : 200,
      message: 'Registration Success',
      data   : {},
    })
  } catch (error) {
    return response
      .writeHead(422, error.message)
      .end()
  }
})

app.post('/login-challenge', (request, response) => {
  const username = request.body.username

  if (!username) {
    return response
      .writeHead(422, 'Field "username" is required')
      .end()
  }

  if (!UserRepo.has(username)) {
    return response
      .writeHead(422, `Username "${username}" not registered`)
      .end()
  }

  const pubKey            = UserRepo.get(username)
  const challengeResponse = wal.newLogin(pubKey)

  request.session.username  = username
  request.session.challenge = challengeResponse.challenge

  response.json(challengeResponse)
})

app.post('/login', (request, response) => {
  const username  = request.session.username
  const challenge = request.session.challenge

  if (!UserRepo.has(username)) {
    return response
      .writeHead(422, `Username "${username}" not registered`)
      .end()
  }

  const credential = UserRepo.get(username)

  try {
    const pubKey = wal.processLogin(request.body, challenge, credential)

    UserRepo.put(username, pubKey)

    response.json({
      code   : 200,
      message: 'Login Success',
      data   : pubKey,
    })
  } catch (error) {
    return response
      .writeHead(422, error.message)
      .end()
  }
})

module.exports = app

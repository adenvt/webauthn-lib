/* eslint-disable @typescript-eslint/no-var-requires, no-console */
const path       = require('path')
const express    = require('express')
const session    = require('express-session')
const bodyParser = require('body-parser')
const WebAuthn   = require('@webauthn-lib/server')
const UserRepo   = require('./api/user-repository')

const app  = express()
const port = 3000
const wal  = new WebAuthn({ rpOrigin: 'http://localhost:3000/' })

app.use(session({ secret: 's3cR3t' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// serve static file and @webauthn-lib/client
app.use(express.static('public'))
app.get('/lib/webauthn-client.js', (request, response) => {
  response.sendFile(path.resolve(__dirname, './node_modules/@webauthn-lib/client/dist/client.min.js'))
})

// API endpoint
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
      message: 'Success',
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
      message: 'Success',
      data   : {},
    })
  } catch (error) {
    return response
      .writeHead(422, error.message)
      .end()
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log('Server starting at port', port)
})

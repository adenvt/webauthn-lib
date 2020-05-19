# Webauthn Lib
> Webauthn server library for Node JS

[![Coverage Status](https://coveralls.io/repos/github/adenvt/webauthn-lib/badge.svg?branch=master)](https://coveralls.io/github/adenvt/webauthn-lib?branch=master)
[![Build Status](https://travis-ci.com/adenvt/webauthn-lib.svg?branch=master)](https://travis-ci.com/adenvt/webauthn-lib)

## Introduction

The Web Authentication API (also known as WebAuthn) is a specification written by the W3C and FIDO, with the participation of Google, Mozilla, Microsoft, Yubico, and others. The API allows servers to register and authenticate users using public key cryptography instead of a password.


This library provide functionality for implementing WebAuthn Server (*Relying Party*).

For a more thorough introduction see:
  - [Guide to Web Authentication](https://webauthn.guide/) by Duo
  - [What is WebAuthn?](https://www.yubico.com/authentication-standards/webauthn/) by Yubico

## Installation

```
npm install @webauthn-lib/client
npm install @webauthn-lib/server
```
## Example
TODO: Example project

## Usage
This library contains 2 packages, for Server-side and Client-side

### on Server-side

#### Initiation
```js
const WebAuthnLib = require('@webauthn-lib/server').default
const wal         = new WebAuthnLib({
  rpOrigin: 'http://webauthn.demo',
})
```

#### Create registration challenge
```js
// Create register challenge
const challengeResponse = wal.newRegister({
  user: {
    id  : WebAuthnLib.generateId(), // generated random id
    name: 'Ade Novid',
  }
})

// Store the generated challenge somewhere so you can have it
// for the verification phase.
// example: store in express-session
req.session.challenge = challengeResponse.challenge

// Send the generated challenge to client
res.json(challengeResponse)
```

#### Verify registration response
```js
const body      = req.body // response from client
const challenge = req.session.challenge

try {
  // Process registration with last challenge stored in session
  // if success, it will return user's PubKey
  const pubKey = wal.processRegister(body, challenge)

  // Store the PubKey into database
  UserModel.create({
    publicKey   : pubKey.publicKey,
    counter     : pubKey.counter,
    credentialId: pubKey.credentialId,
  })
} catch (e) {
  // Do something if error
}
```

#### Create login challenge
```js
const username = req.body.username
const user     = UserModel.findOne({ where: { username }})

if (user) {
  const challengeResponse = wal.newLogin(user.credentialId)

  // Store the generated challenge somewhere so you can have it
  // for the verification phase.
  // example: store in express-session
  req.session.challenge = challengeResponse.challenge
  req.session.username  = req.body.username

  // Send the generated challenge to client
  res.json(challengeResponse)
}
```

#### Verify login response
```js
const body      = req.body // response from client
const challenge = req.session.challenge


try {
  const username   = req.body.username
  const user       = UserModel.findOne({ where: { username }})
  const credential = {
    publicKey   : user.publicKey,
    counter     : user.counter,
    credentialId: user.credentialId,
  }

  // Process login
  const pubKey = wal.processLogin(body, challenge, credential)

  // if success, save new counter into database
  user.update({
    counter: pubKey.counter,
  })

  // Indicate user login is success
  req.session.loggedIn = true

  res.json({
    code   : 200,
    message: 'Logged In',
    data   : {
      loggedIn: true
    }
  })
} catch (e) {
  // Do something if error
}
```

### on Client-side

#### Process registration challenge

```js
import WebAuthnClient from '@webauthn-lib/client'

WebAuthnClient.processRegister(challenge)
  .then((credential) => {
    // send "credential" to server
  })
```
#### Process login challenge

```js
import WebAuthnClient from '@webauthn-lib/client'

WebAuthnClient.processLogin(challenge)
  .then((credential) => {
    // send "credential" to server
  })

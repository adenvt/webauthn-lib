/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
/* global Webauthn */

async function sendPOST (url, data) {
  const response = await fetch(url, {
    method     : 'POST',
    headers    : { 'Content-Type': 'application/json' },
    body       : JSON.stringify(data),
    credentials: 'include',
  })
  if (!response.ok)
    throw new Error(response.statusText)

  return response.json()
}

function doRegister () {
  const username = document.querySelector('#username').value

  sendPOST('/register-challenge', { username })
    .then((challenge) => {
      return Webauthn.processRegister(challenge)
    })
    .then((credential) => {
      return sendPOST('/register', credential)
    })
    .then((response) => {
      window.alert(response.message)
    })
    .catch((error) => {
      window.alert(error.message)
    })
}

function doLogin () {
  const username = document.querySelector('#username').value

  sendPOST('/login-challenge', { username })
    .then((challenge) => {
      return Webauthn.processLogin(challenge)
    })
    .then((credential) => {
      return sendPOST('/login', credential)
    })
    .then((response) => {
      window.alert(response.message)
    })
    .catch((error) => {
      window.alert(error.message)
    })
}

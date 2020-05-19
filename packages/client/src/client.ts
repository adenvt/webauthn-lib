import {
  toUint8,
  validateRegisterChallenge,
  validateLoginChallenge,
} from './utils'

/**
 * Process register challenge
 * @param body Challenge response from server
 */
function processRegister (body: any): Promise<Credential | null> {
  if (!validateRegisterChallenge(body))
    return Promise.reject(new Error('Response body is not valid webauthn registration challenge'))

  const options = {
    ...body,
    challenge: toUint8(body.challenge),
    user     : {
      ...body.user,
      id: toUint8(body.user.id),
    },
  } as PublicKeyCredentialCreationOptions

  return navigator.credentials.create({ publicKey: options })
}

/**
 * Process login challenge
 * @param body Challenge response from server
 */
function processLogin (body: any): Promise<Credential | null> {
  if (!validateLoginChallenge(body))
    return Promise.reject(new Error('Response body is not valid webauthn login challenge'))

  const options = {
    ...body,
    challenge: toUint8(body.challenge),
  } as PublicKeyCredentialRequestOptions

  if (Array.isArray(body.allowCredentials)) {
    options.allowCredentials = body.allowCredentials.map((item: any) => {
      return {
        ...item,
        id: toUint8(item.id),
      }
    })
  }

  return navigator.credentials.get({ publicKey: options })
}

export default {
  processRegister,
  processLogin,
}

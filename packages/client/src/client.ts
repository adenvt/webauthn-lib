import base64 from './base64'
import {
  validateRegisterChallenge,
  validateLoginChallenge,
} from './validations'

/**
 * Process register challenge
 * @param body Challenge response from server
 */
async function processRegister (body: any): Promise<Credential | null> {
  if (!validateRegisterChallenge(body))
    throw new Error('Response body is not valid webauthn registration challenge')

  const options = {
    ...body,
    challenge: base64.toUint8(body.challenge),
    user     : {
      ...body.user,
      id: base64.toUint8(body.user.id),
    },
  } as PublicKeyCredentialCreationOptions

  return base64.encodeObject(await navigator.credentials.create({ publicKey: options }))
}

/**
 * Process login challenge
 * @param body Challenge response from server
 */
async function processLogin (body: any): Promise<Credential | null> {
  if (!validateLoginChallenge(body))
    throw new Error('Response body is not valid webauthn login challenge')

  const options = {
    ...body,
    challenge: base64.toUint8(body.challenge),
  } as PublicKeyCredentialRequestOptions

  if (Array.isArray(body.allowCredentials)) {
    options.allowCredentials = body.allowCredentials.map((item: any) => {
      return {
        ...item,
        id: base64.toUint8(item.id),
      }
    })
  }

  return base64.encodeObject(await navigator.credentials.get({ publicKey: options }))
}

export default {
  processRegister,
  processLogin,
}

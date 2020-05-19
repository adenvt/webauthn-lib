/**
 * Convert base64 to Uint8Array
 * @param base64 Base64 encoded string
 * @internal
 */
function toUint8 (base64: string): Uint8Array {
  return Uint8Array.from(window.atob(base64), (c) => c.charCodeAt(0))
}

/**
 * Process register challenge
 * @param body Challenge response from server
 */
function processRegister (body: any): Promise<Credential | null> {
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

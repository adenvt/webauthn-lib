import { LoginChallenge, RegistrationChallenge } from '@webauthn-lib/server/dist/typed/webauthn'

/**
 * Convert base64 to Uint8Array
 * @param base64 Base64 encoded string
 * @internal
 */
export function toUint8 (base64: string): Uint8Array {
  return Uint8Array.from(window.atob(base64), (c) => c.charCodeAt(0))
}

/**
 * Validate response is valid Register Challenge
 * @param body Response from server
 * @internal
 */
export function validateRegisterChallenge (body: any): body is RegistrationChallenge {
  return !!(body
    && body.challenge
    && body.user
    && body.user.id
    && body.rp
    && body.rp.id
    && body.pubKeyCredParams
    && Array.isArray(body.pubKeyCredParams)
  )
}

/**
 * Validate response is valid Login Challenge
 * @param body Response from server
 * @internal
 */
export function validateLoginChallenge (body: any): body is LoginChallenge {
  return !!(body
    && body.challenge
    && !body.attestation
    && (
      body.allowCredentials
        ? Array.isArray(body.allowCredentials) && body.allowCredentials.every((i: any) => i.id)
        : true
    )
  )
}

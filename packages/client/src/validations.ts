import {
  LoginChallenge,
  RegistrationChallenge,
} from '@webauthn-lib/server/dist/typed/webauthn'

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

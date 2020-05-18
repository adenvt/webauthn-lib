import {
  ResponseCredential, RegistrationRequest, LoginRequest,
} from '../typed/webauthn'

/**
 * Check is valid Credential Response
 * @param credential Response body
 */
export function validateRequest (credential: ResponseCredential<AuthenticatorResponse>): boolean {
  return !!(credential.id
    && credential.rawId
    && credential.response
    && credential.response.clientDataJSON
    && credential.type === 'public-key'
  )
}

/**
 * Check is valid Registration Credential Response
 * @param credential Response body
 */
export function validateRegistrationRequest (credential: ResponseCredential<any>): credential is RegistrationRequest {
  return !!(validateRequest(credential) && credential.response.attestationObject)
}

/**
 * Check is valid Login Credential Response
 * @param credential Response body
 */
export function validateLoginRequest (credential: ResponseCredential<any>): credential is LoginRequest {
  return !!(validateRequest(credential) && credential.response.authenticatorData)
}

import is from './utils/is-type'
import isURL from 'is-url'
import base64url from 'base64url'
import parseClientData from './parser/parse-client-data'
import parseAttestationObject from './parser/parse-attestation-object'
import verifyFidoU2FAttestation from './attestation/fido-u2f'
import verifyAndroidSafetyNetAttestation from './attestation/android-safetynet'
import verifyAndroidKeyAttestation from './attestation/android-key'
import verifyNoneAttestation from './attestation/none'
import verifyPackedX5C from './attestation/packed-x5c'
import verifyPackedSelf from './attestation/packed-self'
import assertionLogin from './assertion/assertion-login'
import { validateRegistrationRequest, validateLoginRequest } from './utils/validations'
import generateRegistrationChallenge from './generator/register-challenge'
import generateLoginChallenge from './generator/login-challenge'
import parseAuthData from './parser/parse-auth-data'
import { hash, createChallenge } from './utils/crypto'
import { AuthenticatorData } from './typed/authenticator-data'
import { ClientDataJSON } from './typed/client-data'
import {
  UserPubKey,
  WebAuthnOption,
  RegistrationOptions,
  RegistrationChallenge,
  RpEntity,
  LoginChallenge,
  CredentialIds,
  LoginOptions,
} from './typed/webauthn'

export default class Webauthn {
  protected rp: RpEntity;
  protected config: WebAuthnOption

  constructor (options: WebAuthnOption) {
    if (!options?.rpOrigin)
      throw new Error('Invalid options, options.rpOrigin is required')

    if (!isURL(options.rpOrigin))
      throw new Error('Invalid options, options.rpOrigin must be valid URL, ex: https://example.com')

    const url = new URL(options.rpOrigin)

    this.config = options
    this.rp     = {
      id  : url.hostname,
      name: options.rpName ?? url.hostname,
      icon: options.rpIcon,
    }
  }

  public static generateId (size?: number): string {
    return createChallenge(size)
  }

  protected validateResponse (clientData: ClientDataJSON, challenge: string, authData: AuthenticatorData): void {
    /**
     * Verify that the value of C.challenge equals the base64url encoding of options.challenge
     */
    const clientChallenge = base64url.toBuffer(clientData.challenge)
    const expectChallgene = base64url.toBuffer(challenge)

    if (!clientChallenge.equals(expectChallgene))
      throw new Error('clientDataJSON.challenge not match with expected challenge')

    /**
     * Verify that the value of C.origin matches the Relying Party's origin
     */
    const url = new URL(clientData.origin)

    if (url.hostname !== this.rp.id)
      throw new Error("The clientData origin's not match Relying Party's origin")
    /* istanbul ignore if */
    if (url.hostname !== 'localhost' && url.protocol !== 'https:')
      throw new Error("The clientData origin's scheme must be https")

    /**
     * Verify that the value of C.tokenBinding.status matches the state of
     * Token Binding for the TLS connection over which the assertion was obtained.
     * If Token Binding was used on that TLS connection, also verify that
     * C.tokenBinding.id matches the base64url encoding
     * of the Token Binding ID for the connection.
     */
    // TODO: Add "Token Binding" support

    /**
     * Verify that the rpIdHash in authData is the SHA-256 hash of
     * the RP ID expected by the Relying Party.
     */
    const rpidHash = hash('SHA256', this.rp.id)
    /* istanbul ignore if */
    if (!rpidHash.equals(authData.rpIdHash))
      throw new Error('rpIdHash not match withRelying Party\'s rpId')

    /**
     * Verify that the User Present bit of the flags in authData is set
     */
    /* istanbul ignore if */
    if (!authData.flags.UP)
      throw new Error('User Present flags must be set true')

    /**
     * If user verification is required for this registration,
     * verify that the User Verified bit of the flags in authData is set.
     */
    // TODO: Add "User Verified" support

    /**
     * Verify that the "alg" parameter in the credential public key in authData
     * matches the alg attribute of one of the items in options.pubKeyCredParams.
     */
    // TODO: Verify alg in publicKey

    /**
     * Verify that the values of the client extension outputs in clientExtensionResults
     * and the authenticator extension outputs in the extensions in authData are as expected,
     */
    // TODO: Add "Extension" support
  }

  /**
   * Generate register challenge
   * @param options options
   * @example
   * ```js
   * webauthn.newRegister({
   *   user: {
   *     id: '12345',
   *     name: 'Lorem Ipsum',
   *   },
   *   attestation: 'none',
   *   authenticator: 'platform',
   * })
   * ```
   */
  public newRegister (options: RegistrationOptions): RegistrationChallenge {
    if (!options?.user)
      throw new Error('Invalid options, options.user is required')

    return generateRegistrationChallenge({
      user         : options.user,
      rp           : options.rp ?? this.rp,
      attestation  : options.attestation ?? this.config.attestation,
      authenticator: options.authenticator ?? this.config.authenticator,
      challengeSize: options.challengeSize ?? this.config.challengeSize,
    })
  }

  /**
   * Process register response
   * @description https://www.w3.org/TR/webauthn-2/#sctn-registering-a-new-credential
   * @param body Authenticator Response
   * @param challenge Expected challenge, challenge from newRegister() which you saved before
   */
  public processRegister (body: any, challenge: string): UserPubKey {
    if (!validateRegistrationRequest(body))
      throw new Error('Request body is not valid webauthn registration request')

    const clientData     = parseClientData(body.response.clientDataJSON)
    const attsObject     = parseAttestationObject(body.response.attestationObject)
    const authData       = parseAuthData(attsObject.authData)
    const clientDataJSON = body.response.clientDataJSON

    this.validateResponse(clientData, challenge, authData)

    let authrInfo: UserPubKey

    if (is.none(attsObject))
      authrInfo = verifyNoneAttestation(attsObject, clientDataJSON)

    else if (is.fidoU2F(attsObject))
      authrInfo = verifyFidoU2FAttestation(attsObject, clientDataJSON)

    else if (is.androidSafetyNet(attsObject))
      authrInfo = verifyAndroidSafetyNetAttestation(attsObject, clientDataJSON)

    else if (is.androidKey(attsObject))
      authrInfo = verifyAndroidKeyAttestation(attsObject, clientDataJSON)

    else if (is.packedX5C(attsObject))
      authrInfo = verifyPackedX5C(attsObject, clientDataJSON)

    else if (is.packedSelf(attsObject))
      authrInfo = verifyPackedSelf(attsObject, clientDataJSON)

    else
      throw new Error(`Unsupport Attestation format: ${attsObject.fmt}`)

    return authrInfo
  }

  /**
   * Generate login challenge
   * @param credentialIds User credentialIds
   * @param options options
   */
  public newLogin (credentialIds?: CredentialIds, options?: LoginOptions): LoginChallenge {
    return generateLoginChallenge(credentialIds, options)
  }

  public processLogin (body: any, challenge: string, credential: UserPubKey | UserPubKey[]): UserPubKey {
    if (!validateLoginRequest(body))
      throw new Error('Request body is not valid webauthn login request')

    const clientData = parseClientData(body.response.clientDataJSON)
    const authData   = parseAuthData(base64url.toBuffer(body.response.authenticatorData))

    this.validateResponse(clientData, challenge, authData)

    const authenticatorData = body.response.authenticatorData
    const signature         = body.response.signature
    const clientDataJSON    = body.response.clientDataJSON
    const credentials       = Array.isArray(credential) ? credential : [credential]

    return assertionLogin(authenticatorData, signature, clientDataJSON, credentials)
  }
}

import { createChallenge } from '../utils/crypto'
import { clean } from '../utils/object'
import {
  LoginChallenge,
  LoginOptions,
  PublicKeyCredentialDescriptor,
  CredentialIds,
} from '../typed/webauthn'

export default function generateLoginChallenge (credentialIds?: CredentialIds, options?: LoginOptions): LoginChallenge {
  if (!credentialIds)
    return generateLoginChallenge([], options)

  if (!Array.isArray(credentialIds))
    return generateLoginChallenge([credentialIds], options)

  let allowCredentials: PublicKeyCredentialDescriptor[] | undefined

  if (credentialIds.length > 0) {
    allowCredentials = credentialIds.map((item) => {
      const credId = typeof item !== 'string'
        ? item.credentialId
        : item

      const transports = options?.allowTransports && options.allowTransports.length > 0
        ? options.allowTransports
        : ['usb', 'nfc', 'ble', 'internal'] // eslint-disable-line array-element-newline, array-bracket-newline

      return {
        id        : credId,
        type      : 'public-key',
        transports: transports,
      } as PublicKeyCredentialDescriptor
    })
  }

  return clean({
    challenge       : createChallenge(options?.challengeSize ?? 32),
    timeout         : 60000,
    allowCredentials: allowCredentials,
    userVerification: 'discouraged',
  })
}

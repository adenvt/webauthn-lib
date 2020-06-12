import cbor from 'cbor'
import base64url from 'base64url'
import { AttestationObject } from '../typed/attestation'

/**
 * Parsing Attestaion Object
 * @param attestationObject Attestation Object string from response body
 */
export default function parseAttestationObject (attestationObject: string): AttestationObject<any> {
  const attestationObjectBuffer = base64url.toBuffer(attestationObject)
  const ctapMakeCredResp        = cbor.decodeAllSync(attestationObjectBuffer)[0]

  return ctapMakeCredResp
}

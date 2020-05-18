import base64url from 'base64url'
import { ClientDataJSON } from '../typed/client-data'

/**
 * Parsing Client Data JSON
 * @param clientDataJSON Client Data JSON from response body
 */
export default function parseClientData (clientDataJSON: string): ClientDataJSON {
  return JSON.parse(base64url.decode(clientDataJSON))
}

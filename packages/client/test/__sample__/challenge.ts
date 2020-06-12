export const registerChallenge = {
  challenge: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=',
  rp       : { id: 'localhost', name: 'Ade Corporate' },
  user     : {
    id         : 'YWRlbnZ0QGdtYWlsLmNvbQ==',
    name       : 'Ade Novid',
    displayName: 'Ade Novid',
  },
  attestation           : 'none',
  pubKeyCredParams      : [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
  authenticatorSelection: { authenticatorAttachment: 'platform' },
  timeout               : 60000,
}

export const loginChallenge = {
  challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=',
  userVerification: 'discouraged',
  timeout         : 60000,
}

export const loginChallengeFull = {
  challenge       : 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=',
  userVerification: 'discouraged',
  allowCredentials: [
    {
      id        : 'abcdefh',
      type      : 'public-key',
      transports: [
        'usb',
        'nfc',
        'ble',
        'internal',
      ],
    },
  ],
  timeout: 60000,
}

export default {
  registerChallenge,
  loginChallenge,
  loginChallengeFull,
}

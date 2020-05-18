import asn1 from '../../src/utils/asn1'

const ASN1_TAG = `
MIHqAgECCgEAAgEBCgEBBCAqQ4LXu9idi1vfF3LP7MoUOSSHuf1XHy63K9+X3gbU
tgQAMIGCv4MQCAIGAWduLuFwv4MRCAIGAbDqja1wv4MSCAIGAbDqja1wv4U9CAIG
AWduLt/ov4VFTgRMMEoxJDAiBB1jb20uZ29vZ2xlLmF0dGVzdGF0aW9uZXhhbXBs
ZQIBATEiBCBa0F7CIcj4OiJhJ97FV1AMPldLxgElqdwhywvkoAZglTAzoQUxAwIB
AqIDAgEDowQCAgEApQUxAwIBBKoDAgEBv4N4AwIBF7+DeQMCAR6/hT4DAgEA
`

test('Parse asn1', () => {
  const stream = Buffer.from(ASN1_TAG, 'base64')
  const result = asn1.parse(stream)

  expect(result).toHaveProperty('type')
  expect(result).toHaveProperty('data')
})

test('Check contains tag', () => {
  const stream = Buffer.from(ASN1_TAG, 'base64')
  const result = asn1.parse(stream)
  const seq    = result.data[6].data

  expect(asn1.hasTag(seq, 400)).toBe(true)
  expect(asn1.hasTag(seq, 600)).toBe(false)
})

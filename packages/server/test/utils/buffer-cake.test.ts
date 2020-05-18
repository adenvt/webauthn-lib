import BufferCake from '../../src/utils/buffer-cake'

test('Must be class', () => {
  const buffer = new BufferCake(Buffer.from('abcdef'))

  expect(buffer).toBeInstanceOf(BufferCake)
})

test('Can be take and slice buffer', () => {
  const buffer = new BufferCake(Buffer.from('abcde'))

  expect(buffer.take(2)).toStrictEqual(Buffer.from('ab'))
  expect(buffer.left()).toBe(3)
  expect(buffer.get()).toStrictEqual(Buffer.from('cde'))
})

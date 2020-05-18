/* eslint-disable unicorn/no-abusive-eslint-disable */
import { clean, isPlainObject } from '../../src/utils/object'

describe('Is plain object', () => {
  /* eslint-disable */
  const sample = {
    '{}'                      : {},
    'null'                    : null,
    'Object.create(null)'     : Object.create(null),
    'Instance of other object': new (function Foo(){})(),
    'Number primitive '       : 5,
    'String primitive '       : 'P',
    'Number Object'           : new Number(6),
    'Built-in Math'           : Math,
    'Boolean'                 : true,
  }

  test('can check is plain object or not', () => {
    expect(isPlainObject(sample)).toBe(true)
    expect(isPlainObject(sample['{}'])).toBe(true)
    expect(isPlainObject(sample['null'])).toBe(false)
    expect(isPlainObject(sample['null'])).toBe(false)
    expect(isPlainObject(sample['Object.create(null'])).toBe(false)
    expect(isPlainObject(sample['Instance of other object'])).toBe(false)
    expect(isPlainObject(sample['Number primitive '])).toBe(false)
    expect(isPlainObject(sample['String primitive '])).toBe(false)
    expect(isPlainObject(sample['Number Object'])).toBe(false)
    expect(isPlainObject(sample['Built-in Math'])).toBe(false)
    expect(isPlainObject(sample['Boolean'])).toBe(false)
  })
})
/* eslint-enable */

describe('Clean object', () => {
  test('Can remove property undefined', () => {
    const source = clean({
      foo : '1234',
      bar : undefined,
      deep: {
        foo: 'foo',
        bar: undefined,
      },
      array: [
        1,
        2,
        3,
      ],
    })

    const target = {
      foo  : '1234',
      deep : { foo: 'foo' },
      array: [
        1,
        2,
        3,
      ],
    }

    expect(source).toStrictEqual(target)
  })

  test('Not mutate source object', () => {
    const source = {
      foo : '1234',
      bar : undefined,
      deep: {
        foo: 'foo',
        bar: undefined,
      },
      array: [
        1,
        2,
        3,
      ],
    }

    const target = clean(source)

    expect(source).toHaveProperty('bar')
    expect(target).not.toHaveProperty('bar')
    expect(source.deep).toHaveProperty('bar')
    expect(target.deep).not.toHaveProperty('bar')
  })
})

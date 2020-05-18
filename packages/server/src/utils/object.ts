/**
 * Check object is plain object
 * @param object Object
 */
export function isPlainObject (object: any): boolean {
  return typeof object === 'object'
    && object !== null
    && object.constructor === Object
    && Object.prototype.toString.call(object) === '[object Object]'
}

/**
 * Remove undefined property from object
 * @param object Object
 */
export function clean (object: any): any {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined) // Remove undefined
    .reduce((newObject, key) => {
      return isPlainObject(object[key])
        ? { ...newObject, [key]: clean(object[key]) } // Recurse.
        : { ...newObject, [key]: object[key] } // Copy value.
    }, {})
}

export default { clean, isPlainObject }

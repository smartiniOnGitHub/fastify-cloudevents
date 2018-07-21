/*
 * Copyright 2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

/**
 * Validators:
 * this module exports some useful generic functions for the validation of objects.
 */

const url = require('url')

module.exports.isUndefinedOrNull = function (arg) {
  return (arg === undefined || arg === null)
}

module.exports.isDefinedAndNotNull = function (arg) {
  return (arg !== undefined && arg !== null)
}

module.exports.isString = function (arg) {
  return (this.isDefinedAndNotNull(arg) && (typeof arg === 'string'))
}

module.exports.isStringNotEmpty = function (arg) {
  return (this.isString(arg) && (arg.length > 0))
}

module.exports.isDate = function (arg) {
  return (this.isDefinedAndNotNull(arg) && (typeof arg === 'object' || arg instanceof Date))
}

module.exports.isDateValid = function (arg) {
  return (this.isDate(arg) && !isNaN(arg))
}

module.exports.isDatePast = function (arg) {
  return (this.isDateValid(arg) && arg < Date.now())
}

module.exports.isNumber = function (arg) {
  return (this.isDefinedAndNotNull(arg) && typeof arg === 'number' && !isNaN(arg))
}

module.exports.isArray = function (arg) {
  return (this.isDefinedAndNotNull(arg) && (Array.isArray(arg)))
}

module.exports.isBoolean = function (arg) {
  return (typeof arg === 'boolean')
}

module.exports.isFunction = function (arg) {
  return (typeof arg === 'function')
}

module.exports.isObject = function (arg) {
  return (this.isDefinedAndNotNull(arg) && (typeof arg === 'object'))
}

module.exports.isKeyedCollection = function (arg) {
  return (this.isDefinedAndNotNull(arg) && (
    arg instanceof Map || arg instanceof WeakMap ||
    arg instanceof Set || arg instanceof WeakSet
  ))
}

module.exports.isObjectOrCollection = function (arg) {
  return (this.isObject(arg) || this.isKeyedCollection(arg))
}

module.exports.isObjectOrCollectionNotString = function (arg) {
  return (this.isObjectOrCollection(arg) && (typeof arg !== 'string'))
}

module.exports.isVersion = function (arg) {
  // quick check if the given string is in the format 'n.n.n'
  // note that as minimum a number is needed for an integer version
  // note that at the beginning I can have an optional char 'v' or 'V'
  // note that anything after the third number will be considered as a string
  // note: updated to handle version output of 'git describe'
  const versionRegex = /^(?:v|V?)((\d+)(?:\.?)){1,3}(?:\W|_?)(.*)$/gm
  return (this.isStringNotEmpty(arg) && versionRegex.test(arg))
}

module.exports.isURI = function (arg, base) {
  // quick check if the given string is an URI or an URL
  if (!this.isStringNotEmpty(arg)) {
    return false
  }
  // simple check if it's an URL, trying to instancing it
  // note that this requires to import related module here (but not in Browsers) ...
  if (this.isStringNotEmpty(base)) {
    try {
      const u = new url.URL(arg, base)
      return (u !== null)
    } catch (e) {
      // console.error(e)
      return false
    }
  } else {
    // simple check if it's an URI (or better, a relative URL)
    if (arg.startsWith('/')) {
      return true
    }
    try {
      // return (new URL(arg) !== null)
      const u = new url.URL(arg)
      return (u !== null)
    } catch (e) {
      // console.error(e)
      return false
    }
  }
}

module.exports.ensureIsString = function (arg, name) {
  if (!this.isString(arg)) {
    return new TypeError(`The argument '${name}' must be a string, instead got a '${typeof arg}'`)
  }
}

module.exports.ensureIsStringNotEmpty = function (arg, name) {
  if (!this.isStringNotEmpty(arg)) {
    return new Error(`The string '${name}' must be not empty`)
  }
}

module.exports.ensureIsObjectOrCollection = function (arg, name) {
  if (!this.isObjectOrCollection(arg)) {
    return new TypeError(`The object '${name}' must be an object or a collection`)
  }
}

module.exports.ensureIsObjectOrCollectionNotString = function (arg, name) {
  if (!this.isObjectOrCollectionNotString(arg)) {
    return new TypeError(`The object '${name}' must be an object or a collection, and not a string`)
  }
}

module.exports.ensureIsDatePast = function (arg, name) {
  if (!this.isDatePast(arg)) {
    return new Error(`The object '${name}' must be a Date that belongs to the past`)
  }
}

module.exports.ensureIsVersion = function (arg, name) {
  if (!this.isVersion(arg)) {
    return new Error(`The object '${name}' must be a string in the format 'n.n.n', and not '${arg}'`)
  }
}

module.exports.ensureIsURI = function (arg, name) {
  if (!this.isURI(arg)) {
    return new Error(`The object '${name}' must be an URI or URL string, and not '${arg}'`)
  }
}

module.exports.getSize = function (arg) {
  if ((arg === undefined || arg === null)) {
    return
  }
  if (Array.isArray(arg)) {
    return arg.length
  } else if (arg instanceof Map || arg instanceof Set) {
    return arg.size
  } else if (typeof arg === 'object') {
    return Object.keys(arg).length
  } else if (typeof arg === 'string') {
    return arg.length
  }
}

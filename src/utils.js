/*
 * Copyright 2018-2026 the original author or authors.
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
 * Utility functions module.
 * @module utility
 */

const { CloudEventTransformer } = require('cloudevent')

function ensureIsString (arg, name = 'arg') {
  if (arg !== null && typeof arg !== 'string') {
    throw new TypeError(`The argument '${name}' must be a string, instead got a '${typeof arg}'`)
  }
}

function ensureIsBoolean (arg, name = 'arg') {
  if (arg !== null && typeof arg !== 'boolean') {
    throw new TypeError(`The argument '${name}' must be a boolean, instead got a '${typeof arg}'`)
  }
}

function ensureIsObject (arg, name = 'arg') {
  if (arg !== null && typeof arg !== 'object') {
    throw new TypeError(`The argument '${name}' must be a object, instead got a '${typeof arg}'`)
  }
}

function ensureIsObjectPlain (arg, name = 'arg') {
  if (arg !== null && Object.prototype.toString.call(arg) === '[object Object]') {
    return new TypeError(`The argument '${name}' must be a plain object, instead got a '${typeof arg}'`)
  }
}

function ensureIsFunction (arg, name = 'arg') {
  if (arg !== null && typeof arg !== 'function') {
    throw new TypeError(`The argument '${name}' must be a function, instead got a '${typeof arg}'`)
  }
}

const hostname = require('node:os').hostname()
const idPrefix = `fastify@${hostname}`
function * idMaker () {
  while (true) {
    const timestamp = CloudEventTransformer.timestampToNumber()
    yield `${idPrefix}@${timestamp}`
  }
}

function isDefinedAndNotNull (arg) {
  return (arg !== undefined && arg !== null)
}

function isValue (arg) {
  return ((arg !== undefined && arg !== null) &&
    (typeof arg === 'string' || typeof arg === 'boolean' || (typeof arg === 'number' && !isNaN(arg)))
  )
}

module.exports = {
  ensureIsString,
  ensureIsBoolean,
  ensureIsObject,
  ensureIsObjectPlain,
  ensureIsFunction,
  idMaker,
  isDefinedAndNotNull,
  isValue
}

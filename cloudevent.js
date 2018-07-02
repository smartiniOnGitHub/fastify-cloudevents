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

// this module exports some useful definition and utility related to CloudEvents

const url = require('url')

// const fastJsonStringify = require('fast-json-stringify') // TODO: enable when needed ...

const cloudEventMediaType = 'application/cloudevents+json'

// TODO: add doc and write to call it with the new operator ... wip

function CloudEventCreate (eventID, eventType, data, {
  cloudEventsVersion = '0.1',
  eventTypeVersion,
  source = '/',
  eventTime = new Date(),
  extensions,
  contentType = 'application/json',
  schemaURL,
  strict = false } = {}
) {
  // console.log(`DEBUG - eventID = ${eventID}, eventType = ${eventType}, data = ${data}, { strict = ${strict}, ... }`)
  if (strict === true) {
    if (!eventID || !eventType) {
      throw new Error('Unable to create CloudEvent instance, mandatory field missing')
    }
  }

  this.eventID = eventID
  this.eventType = eventType
  this.data = data

  this.cloudEventsVersion = cloudEventsVersion
  this.contentType = contentType
  this.eventTime = eventTime
  this.eventTypeVersion = eventTypeVersion
  this.extensions = extensions
  this.schemaURL = schemaURL
  this.source = source

  this.strict = strict // could be useful ...
}

function cloudEventValidation (event, { strict = false } = {}) {
  // console.log(`DEBUG - cloudEvent = ${event}, { strict = ${strict}, ... }`)
  if (isUndefinedOrNull(event)) {
    return [new Error('CloudEvent undefined or null')]
  }
  let validationErrors = []

  // standard validation
  validationErrors.push(ensureIsStringNotEmpty(event.cloudEventsVersion, 'cloudEventsVersion'))
  validationErrors.push(ensureIsStringNotEmpty(event.eventID, 'eventID'))
  validationErrors.push(ensureIsStringNotEmpty(event.eventType, 'eventType'))
  // no check here because I assign a default value, and I check in strict mode ... ok
  // if (isDefinedAndNotNull(event.data)) {
  // validationErrors.push(ensureIsObjectOrCollectionNotString(event.data, 'data'))
  // }
  if (isDefinedAndNotNull(event.eventTypeVersion)) {
    validationErrors.push(ensureIsStringNotEmpty(event.eventTypeVersion, 'eventTypeVersion'))
  }
  // no check here because I assign a default value, and I check in strict mode ... ok
  // if (isDefinedAndNotNull(event.source)) {
  // validationErrors.push(ensureIsStringNotEmpty(event.source, 'source')) // keep commented here ... ok
  // }
  // no check here because I assign a default value, and I check in strict mode ... ok
  // validationErrors.push(ensureIsDateValid(event.eventTime, 'eventTime'))
  // no check here because I assign a default value, and I check in strict mode ... ok
  // if (isDefinedAndNotNull(event.extensions)) {
  //   validationErrors.push(ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
  // }
  // no check here because I assign a default value, and I check in strict mode ... ok
  // validationErrors.push(ensureIsStringNotEmpty(event.contentType, 'contentType'))
  if (isDefinedAndNotNull(event.schemaURL)) {
    validationErrors.push(ensureIsStringNotEmpty(event.schemaURL, 'schemaURL'))
  }

  // additional validation if strict mode enabled, or if enabled in the event ...
  if (strict === true || event.strict === true) {
    validationErrors.push(ensureIsVersion(event.cloudEventsVersion, 'cloudEventsVersion'))
    if (isDefinedAndNotNull(event.data)) {
      validationErrors.push(ensureIsObjectOrCollectionNotString(event.data, 'data'))
    }
    if (isDefinedAndNotNull(event.eventTypeVersion)) {
      validationErrors.push(ensureIsVersion(event.eventTypeVersion, 'eventTypeVersion'))
    }
    validationErrors.push(ensureIsURI(event.source, 'source'))
    if (isDefinedAndNotNull(event.extensions)) {
      validationErrors.push(ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
      // if present, ensure it contains at least 1 element
      // TODO: implement/uncomment to finish ... wip
    }
    validationErrors.push(ensureIsDatePast(event.eventTime, 'eventTime'))
    validationErrors.push(ensureIsStringNotEmpty(event.contentType, 'contentType'))
    validationErrors.push(ensureIsURI(event.schemaURL, 'schemaURL'))
  }

  return validationErrors.filter((i) => i)
}

// TODO: add isValidationSuccessful that checks the size of validationErrors, and expose outside ... wip

function isValid (event, { strict = false } = {}) {
  if (isUndefinedOrNull(event)) {
    return false
  }
  // console.log(`DEBUG - cloudEvent details: eventID = ${event.eventID}, eventType = ${event.eventType}, data = ${event.data}, ..., strict = ${event.strict}`)
  let valid = isStringNotEmpty(event.cloudEventsVersion) &&
    isStringNotEmpty(event.eventID) &&
    isStringNotEmpty(event.eventType) &&
    (isUndefinedOrNull(event.data) || isObjectOrCollectionNotString(event.data)) && // can be object, Set, or Map ...
    (isUndefinedOrNull(event.eventTypeVersion) || isStringNotEmpty(event.eventTypeVersion)) &&
    isStringNotEmpty(event.source) &&
    isDateValid(event.eventTime) &&
    (isUndefinedOrNull(event.extensions) || isObjectOrCollectionNotString(event.extensions)) && // can be object, Set, or Map ...
    isStringNotEmpty(event.contentType) &&
    (isUndefinedOrNull(event.schemaURL) || isStringNotEmpty(event.schemaURL))

  // additional checks if strict mode enabled, or if enabled in the event ...
  if (valid === true && (strict === true || event.strict === true)) {
    valid = isVersion(event.cloudEventsVersion) &&
      isVersion(event.eventTypeVersion) &&
      isURI(event.source) &&
      isDatePast(event.eventTime) &&
      isURI(event.schemaURL)
  }

  return valid
}

// TODO: move isXxx and ensureXxx functions in a dedicated source ...

function isUndefinedOrNull (arg) {
  return (arg === undefined || arg === null)
}

function isDefinedAndNotNull (arg) {
  return (arg !== undefined && arg !== null)
}

function isString (arg) {
  return (isDefinedAndNotNull(arg) && (typeof arg === 'string'))
}

function isStringNotEmpty (arg) {
  return (isString(arg) && (arg.length > 0))
}

function isDate (arg) {
  return (isDefinedAndNotNull(arg) && (typeof arg === 'object' || arg instanceof Date))
}

function isDateValid (arg) {
  return (isDate(arg) && !isNaN(arg))
}

function isDatePast (arg) {
  return (isDateValid(arg) && arg < Date.now())
}

/*
function isNumber (arg) {
  return (isDefinedAndNotNull(arg) && typeof arg === 'number' && !isNaN(arg))
}
 */

function isObjectOrCollection (arg) {
  return (isDefinedAndNotNull(arg) && (typeof arg === 'object' ||
    arg instanceof Map || arg instanceof WeakMap ||
    arg instanceof Set || arg instanceof WeakSet
  ))
}

function isObjectOrCollectionNotString (arg) {
  return (isObjectOrCollection(arg) && (typeof arg !== 'string'))
}

function isVersion (arg) {
  // quick check if the given string is in the format 'n.n.n'
  // note that a trailing string (like '_hash') is not allowed at the moment
  const versionRegex = /^(?:(\d+)\.){0,2}(\d+)$/gm
  return (isStringNotEmpty(arg) && versionRegex.test(arg))
}

function isURI (arg) {
  // quick check if the given string is an URI or an URL
  if (!isStringNotEmpty(arg)) {
    return false
  }
  // in future handle in a more general way with: new URL(input[, base]) ...
  // simple check if it's an URI (or better, a relative URL)
  if (arg.startsWith('/')) {
    return true
  }
  // simple check if it's an URL, trying to instancing it
  // note that this requires to import related module here (but not in Browsers) ...
  try {
    // return (new URL(arg) !== null)
    const u = new url.URL(arg)
    return (u !== null)
  } catch (e) {
    // console.error(e)
    return false
  }
}

/*
function ensureIsString (arg, name) {
  if (!isString(arg)) {
    return new TypeError(`The argument '${name}' must be a string, instead got a '${typeof arg}'`)
  }
}
 */

function ensureIsStringNotEmpty (arg, name) {
  if (!isStringNotEmpty(arg)) {
    return new Error(`The string '${name}' must be not empty`)
  }
}

/*
function ensureIsObjectOrCollection (arg, name) {
  if (!isObjectOrCollection(arg)) {
    return new TypeError(`The object '${name}' must be an object or a collection`)
  }
}
 */

function ensureIsObjectOrCollectionNotString (arg, name) {
  if (!isObjectOrCollectionNotString(arg)) {
    return new TypeError(`The object '${name}' must be an object or a collection, and not a string`)
  }
}

function ensureIsDatePast (arg, name) {
  if (!isDatePast(arg)) {
    return new Error(`The object '${name}' must be a Date that belongs to the past`)
  }
}

function ensureIsVersion (arg, name) {
  if (!isVersion(arg)) {
    return new Error(`The object '${name}' must be a string in the format 'n.n.n', and not '${arg}'`)
  }
}

function ensureIsURI (arg, name) {
  if (!isURI(arg)) {
    return new Error(`The object '${name}' must be an URI or URL string, and not '${arg}'`)
  }
}

class CloudEvent {
  // TODO: implement in its own repository [cloudevent.js](https://github.com/smartiniOnGitHub/cloudevent.js) and import/use here ... do it after first release ...
}

module.exports = {
  mediaType: cloudEventMediaType,
  CloudEventCreate: CloudEventCreate,
  isCloudEventValid: isValid,
  cloudEventValidation: cloudEventValidation,
  CloudEvent: CloudEvent // temp, check if it's a good way ...
}

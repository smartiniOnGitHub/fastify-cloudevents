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

// const fastJsonStringify = require('fast-json-stringify') // TODO: enable when needed ...

const cloudEventMediaType = 'application/cloudevents+json'

// TODO: add doc and write to call it with the new operator ... wip

function CloudEventCreate (eventID, eventType, data = {}, {
  cloudEventsVersion = '0.1',
  eventTypeVersion,
  source = '/',
  eventTime = new Date(),
  extensions,
  contentType = 'application/json',
  schemaURL,
  strict = false } = {}
) {
  // console.log(`DEBUG - eventID = ${eventID}, eventType = ${eventType}, data = ${data}, { strict = ${strict}, ... }`) // temp ...
  if (strict === true) {
    if (!eventID || !eventType || !data) {
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

// TODO: add a function cloudEventValidation (event) or similar, but check how to return a list on errors ... wip
function cloudEventValidation (event, { strict = false } = {}) {
  // console.log(`DEBUG - cloudEvent = ${event}, { strict = ${strict}, ... }`) // temp ...
  if (isUndefinedOrNull(event)) {
    return [new Error('CloudEvent undefined or null')] // temp (old) ...
    /*
    // TODO: check later if enable something like this ... no, the current approach is simpler and works well the same
    return {
      errors: [ new Error('CloudEvent undefined or null') ],
      count: 1
    }
     */
  }
  // console.log(`DEBUG - cloudEvent details: eventID = ${event.eventID}, eventType = ${event.eventType}, data = ${event.data}, ..., strict = ${event.strict}`) // temp ...
  let validationErrors = []

  // standard validation
  // TODO: complete implementation ... wip
  validationErrors.push(ensureIsStringNotEmpty(event.cloudEventsVersion, 'cloudEventsVersion'))
  validationErrors.push(ensureIsStringNotEmpty(event.eventID, 'eventID'))
  validationErrors.push(ensureIsStringNotEmpty(event.eventType, 'eventType'))
  // if (isDefinedAndNotNull(event.data)) { // no check here because I assign a default value, and I check in strict mode ...
  // validationErrors.push(ensureIsObjectOrCollection(event.data, 'data')) // TODO: enable ...
  // }
  if (isDefinedAndNotNull(event.eventTypeVersion)) {
    validationErrors.push(ensureIsStringNotEmpty(event.eventTypeVersion, 'eventTypeVersion'))
  }
  // if (isDefinedAndNotNull(event.source)) { // no check here because I assign a default value, and I check in strict mode ...
  // validationErrors.push(ensureIsStringNotEmpty(event.source, 'source')) // TODO: keep commented here ... ok
  // }
  // no check here because I assign a default value, and I check in strict mode ... ok
  // validationErrors.push(ensureIsDateValid(event.eventTime, 'eventTime'))
  if (isDefinedAndNotNull(event.extensions)) {
    // validationErrors.push(ensureIsObjectOrCollection(event.extensions, 'extensions')) // TODO: enable ...
  }
  // no check here because I assign a default value, and I check in strict mode ... ok
  // validationErrors.push(ensureIsStringNotEmpty(event.contentType, 'contentType'))
  if (isDefinedAndNotNull(event.schemaURL)) {
    validationErrors.push(ensureIsStringNotEmpty(event.schemaURL, 'schemaURL'))
  }

  // additional validation if strict mode enabled, or if enabled in the event ...
  if (strict === true || event.strict === true) {
    // TODO: implement ... wip
    /*
    ensureIsVersion(event.cloudEventsVersion, 'cloudEventsVersion')
    ensureIsObjectOrCollection(event.data, 'data') // if present
    ensureIsVersion(event.eventTypeVersion, 'eventTypeVersion') // if present
    ensureIsURI(event.source, 'source')
    ensureIsObjectOrCollection(event.extensions, 'extensions') // if present, ensure it contains at least 1 element
    ensureIsDatePast(event.eventTime, 'eventTime')
    ensureIsStringNotEmpty(event.contentType, 'contentType')
    ensureIsURI(event.schemaURL, 'schemaURL')
     */
    // TODO: check if raise excptions in this case, using assert statements ... wip
  }

  // TODO: check if change from array to Set for validation errors, using field as a key (non unique) ... no, but maybe add some useful properties to Error instances created ... wip
  /*
  // TODO: check if return something like this ... no, the other approach is simpler
  return {
    errors: validationErrors,
    count: validationErrors.filter((i) => i !== null)
  }
   */
  return validationErrors.filter((i) => i)
}

// TODO: add isValidationSuccessful that checks the size of validationErrors, and expose outside ... wip

// TODO: add a function isCloudEventValid (event) or similar, that return a boolen value ... wip
function isValid (event, { strict = false } = {}) {
  // console.log(`DEBUG - cloudEvent = ${event}, { strict = ${strict}, ... }`) // temp ...
  if (isUndefinedOrNull(event)) {
    return false
  }
  // console.log(`DEBUG - cloudEvent details: eventID = ${event.eventID}, eventType = ${event.eventType}, data = ${event.data}, ..., strict = ${event.strict}`) // temp ...
  let valid = isStringNotEmpty(event.cloudEventsVersion) ||
    isStringNotEmpty(event.eventID) ||
    isStringNotEmpty(event.eventType) ||
    (isDefinedAndNotNull(event.data) && isObjectOrCollection(event.data)) || // can be object, Set, or Map ...
    (isDefinedAndNotNull(event.eventTypeVersion) && isStringNotEmpty(event.eventTypeVersion)) ||
    isStringNotEmpty(event.source) ||
    isDateValid(event.eventTime) ||
    (isDefinedAndNotNull(event.extensions) && isObjectOrCollection(event.extensions)) || // can be object, Set, or Map ...
    isStringNotEmpty(event.contentType) ||
    (isDefinedAndNotNull(event.schemaURL) && isStringNotEmpty(event.schemaURL))

  // additional checks if strict mode enabled, or if enabled in the event ...
  if (valid === true && (strict === true || event.strict === true)) {
    /*
    // TODO: future use ...
    valid = isVersion(event.cloudEventsVersion) ||
      isVersion(event.eventTypeVersion) ||
      isURI(event.source) ||
      isDatePast(event.eventTime) ||
      isURI(event.schemaURL)
     */
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

/*
function isDatePast (arg) {
  return (isDateValid(arg) && // TODO: and is in the past ...
}

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

/*
function ensureIsString (arg, name) {
  if (!isString(arg)) {
    return new TypeError(`The argument '${name}' must be a string, instead got a '${typeof arg}'`)
  }
}
 */

function ensureIsStringNotEmpty (arg, name) {
  if (!isStringNotEmpty(arg)) {
    return new TypeError(`The string '${name}' must be not empty`)
  }
}

class CloudEvent {
  // TODO: implement ...
}

module.exports = {
  mediaType: cloudEventMediaType,
  CloudEventCreate: CloudEventCreate,
  isCloudEventValid: isValid,
  cloudEventValidation: cloudEventValidation,
  CloudEvent: CloudEvent // temp, check if it's a good way ...
}

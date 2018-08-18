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
 * CloudEvent:
 * this module exports some useful definition and utility related to CloudEvents.
 */

const validators = require('./validators') // get validators from here

// const fastJsonStringify = require('fast-json-stringify') // TODO: enable when needed ...

const mediaType = 'application/cloudevents+json'

// TODO: add doc and write to call it with the new operator ... check if remove default values in the doc here ... then generate related docs (with esdoc but with npx) ... wip
// TODO: then update to ensure strict has been put in the right place even here ... wip

/**
 * Create a new instance of a CloudEvent object.
 * Must be called with the 'new' operator to return the new object instance.
 *
 * @see https://github.com/cloudevents/spec/blob/master/json-format.md
 *
 * @param {!string} eventID the ID of the event (unique), mandatory
 * @param {!string} eventType the type of the event (usually), mandatory
 * @param {(object|Map|Set)} data the real event data
 * @param {object} options optional attributes of the event; some has default values chosen here:
 *        cloudEventsVersion (string, default '0.1'),
 *        eventTypeVersion (string) optional,
 *        source (uri, default '/'),
 *        eventTime (timestamp, default now),
 *        extensions (object) optional but if given must contain at least 1 property (key/value),
 *        contentType (string, default 'application/json') tell how the data attribute must be encoded,
 *        schemaURL (uri) optional,
 *        strict (boolean, default false) tell if object instance will be validated in a more strict way
 * @throws {Error} if strict is true and eventID or eventType is undefined or null
 */
function Create (eventID, eventType, data, {
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

  // add strict to extensions, but only when defined
  if (strict === true) {
    this.extensions = extensions || {}
    this.extensions.strict = strict
  }
}

/**
 * Tell if the object has the strict flag enabled.
 * @type {boolean}
 * @throws {Error} if event if undefined or null
 * @private
 */
function isStrict (event) {
  if (validators.isUndefinedOrNull(event)) {
    throw new Error('CloudEvent undefined or null')
  }
  if (validators.isDefinedAndNotNull(event.extensions)) {
    return event.extensions.strict
  } else {
    return false
  }
}

/**
 * Validate the given CloudEvent.
 *
 * @param {!object} event the CloudEvent to validate
 * @param {object} options containing: strict (boolean, default false) to validate it in a more strict way
 * @return {object[]} an array of (non null) validation errors, or at least an empty array
 */
function validate (event, { strict = false } = {}) {
  // console.log(`DEBUG - cloudEvent = ${event}, { strict = ${strict}, ... }`)
  if (validators.isUndefinedOrNull(event)) {
    return [new Error('CloudEvent undefined or null')]
  }
  let ve = [] // validation errors

  // standard validation
  ve.push(validators.ensureIsStringNotEmpty(event.cloudEventsVersion, 'cloudEventsVersion'))
  ve.push(validators.ensureIsStringNotEmpty(event.eventID, 'eventID'))
  ve.push(validators.ensureIsStringNotEmpty(event.eventType, 'eventType'))
  // no check here because I assign a default value, and I check in strict mode ... ok
  // if (validators.isDefinedAndNotNull(event.data)) {
  // ve.push(validators.ensureIsObjectOrCollectionNotString(event.data, 'data'))
  // }
  if (validators.isDefinedAndNotNull(event.eventTypeVersion)) {
    ve.push(validators.ensureIsStringNotEmpty(event.eventTypeVersion, 'eventTypeVersion'))
  }
  // no check here because I assign a default value, and I check in strict mode ... ok
  // if (validators.isDefinedAndNotNull(event.source)) {
  // ve.push(validators.ensureIsStringNotEmpty(event.source, 'source')) // keep commented here ... ok
  // }
  // no check here because I assign a default value, and I check in strict mode ... ok
  // ve.push(validators.ensureIsDateValid(event.eventTime, 'eventTime'))
  // no check here because I assign a default value, and I check in strict mode ... ok
  // if (validators.isDefinedAndNotNull(event.extensions)) {
  //   ve.push(validators.ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
  // }
  // no check here because I assign a default value, and I check in strict mode ... ok
  // ve.push(ensureIsStringNotEmpty(event.contentType, 'contentType'))
  if (validators.isDefinedAndNotNull(event.schemaURL)) {
    ve.push(validators.ensureIsStringNotEmpty(event.schemaURL, 'schemaURL'))
  }

  // additional validation if strict mode enabled, or if enabled in the event ...
  if (strict === true || isStrict(event) === true) {
    ve.push(validators.ensureIsVersion(event.cloudEventsVersion, 'cloudEventsVersion'))
    if (validators.isDefinedAndNotNull(event.data)) {
      ve.push(validators.ensureIsObjectOrCollectionNotString(event.data, 'data'))
    }
    if (validators.isDefinedAndNotNull(event.eventTypeVersion)) {
      ve.push(validators.ensureIsVersion(event.eventTypeVersion, 'eventTypeVersion'))
    }
    ve.push(validators.ensureIsURI(event.source, 'source'))
    if (validators.isDefinedAndNotNull(event.extensions)) {
      ve.push(validators.ensureIsObjectOrCollectionNotString(event.extensions, 'extensions'))
      const extensionsSize = validators.getSize(event.extensions)
      if (extensionsSize < 1) {
        ve.push(new Error(`The object 'extensions' must contain at least 1 property`))
      }
    }
    ve.push(validators.ensureIsDatePast(event.eventTime, 'eventTime'))
    ve.push(validators.ensureIsStringNotEmpty(event.contentType, 'contentType'))
    ve.push(validators.ensureIsURI(event.schemaURL, 'schemaURL'))
  }

  return ve.filter((i) => i)
}

/**
 * Tell the given CloudEvent, if it's valid.
 *
 * @param {!object} event the CloudEvent to validate
 * @param {object} options containing: strict (boolean, default false) to validate it in a more strict way
 * @return {boolean} true if valid, otherwise false
 */
function isValid (event, { strict = false } = {}) {
  // console.log(`DEBUG - cloudEvent details: eventID = ${event.eventID}, eventType = ${event.eventType}, data = ${event.data}, ..., strict = ${event.strict}`)
  const validationErrors = validate(event, { strict })
  const size = validators.getSize(validationErrors)
  // console.log(`DEBUG - isValid: validationErrors = ${validationErrors}, size = ${size}`)
  return (size === 0)
}

const fastJson = require('fast-json-stringify')
// define a schema for serializing a CloudEvent object to JSON
// note that additionalProperties will be ignored
const ceSchema = {
  title: 'CloudEvent Schema with required fields',
  type: 'object',
  properties: {
    cloudEventsVersion: { type: 'string' },
    eventID: { type: 'string' },
    eventType: { type: 'string' },
    // data: { type: 'object' },
    eventTypeVersion: { type: 'string' },
    source: { type: 'string' },
    eventTime: { type: 'string' },
    // extensions: { type: 'object' },
    contentType: { type: 'string' },
    // TODO: use if/then/else on contantType ... wip
    schemaURL: { type: 'string' }
  },
  required: ['cloudEventsVersion', 'eventID', 'eventType',
    'source', 'contentType'
  ],
  additionalProperties: true // to handle data, extensions, and maybe other (non-standard) properties
}
const stringify = fastJson(ceSchema)

// TODO: check how to handle serialization in a different format (maybe via a serializer function) ... wip
// TODO: add options argument like: serialization schema for data (and another for extensions) to merge with the current one, additionalProperties to override, etc ... wip
/**
 * Serialize the given CloudEvent in JSON format.
 *
 * @param {!object} event the CloudEvent to serialize
 * @return {string} the serialized event, as a string
 */
function serialize (event) {
  // console.log(`DEBUG - cloudEvent details: eventID = ${event.eventID}, eventType = ${event.eventType}, data = ${event.data}, ..., strict = ${event.strict}`)
  // TODO: handle contentType when serializing the data attribute ... wip
  const serialized = stringify(event)
  // console.log(`DEBUG - serialize: serialized = '${serialized}'`)
  // TODO: comment log statements ... wip
  return serialized
}

module.exports = {
  mediaType: mediaType,
  CloudEventCreate: Create,
  isCloudEventValid: isValid,
  cloudEventValidation: validate,
  cloudEventSerialization: serialize
}

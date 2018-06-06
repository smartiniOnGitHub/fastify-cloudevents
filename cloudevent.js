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

const cloudEventMediaType = 'application/cloudevents+json'

// TODO: check if use default values for arguments ... yes, but in a new CloudEventCreateFast without type checks (and call it from this and from the Minimal version); or move all type checks here in a CloudEventValidator called only if/when needed
// TODO: add doc and write to call it with the new operator ...

function CloudEventCreateFast ({
  cloudEventsVersion = '0.1',
  eventType,
  eventTypeVersion = '1.0',
  source,
  eventID,
  eventTime, // TODO: add as default: = getCurrentTimestamp() ma che torna Date/Timestamp ...
  extensions = {},
  contentType = 'application/json',
  schemaURL } = {}, data = {} // TODO: check if add another for data-related fields ... wip
) {
  this.cloudEventsVersion = cloudEventsVersion
  this.eventType = eventType
  this.eventTypeVersion = eventTypeVersion
  this.source = source
  this.eventID = eventID
  this.eventTime = eventTime
  this.extensions = extensions
  this.contentType = contentType
  this.schemaURL = schemaURL
  this.data = data
}

/*
// TODO: deprecated, then comment and remove ... wip
function CloudEventCreateFull (cloudEventsVersion,
  eventType, eventTypeVersion,
  source,
  eventID, eventTime,
  extensions,
  contentType, schemaURL, data
) {
  this.cloudEventsVersion = cloudEventsVersion || '0.1'
  this.eventType = eventType
  this.eventTypeVersion = eventTypeVersion || '1.0'
  this.source = source
  this.eventID = eventID
  this.eventTime = eventTime // TODO: or new date formatted to timestamp ...
  this.extensions = extensions
  this.contentType = contentType || 'application/json'
  this.schemaURL = schemaURL
  this.data = data || {}

  // TODO: move in a validator, but check how to return a list on errors ...
  if (cloudEventsVersion) {
    ensureIsString(cloudEventsVersion, 'cloudEventsVersion')
  }
  ensureIsStringNotEmpty(eventType, 'eventType')
  if (eventTypeVersion) {
    ensureIsString(eventTypeVersion, 'eventTypeVersion')
  }
  ensureIsStringNotEmpty(source, 'source') // TODO: check if it's an URI ...
  ensureIsStringNotEmpty(eventID, 'eventID')
  if (eventTime) {
    ensureIsString(eventTime, 'eventTime') // TODO: ensure is a timestamp in the right format, if given ...
  } // TODO: else check if create a default one here ...
  if (extensions) {
    // TODO: extensions is a Map, and if present must contain at least 1 element ...
  } // TODO: else check if define as empty object or empty Map ...
  if (contentType) {
    ensureIsString(contentType, 'contentType')
  }
  if (schemaURL) {
    ensureIsString(schemaURL, 'schemaURL') // TODO: check if it's an URI ...
  }
  if (data) {
    // TODO: data can be object, string, or Map ...
  }
}
 */

// TODO: check if add CloudEvent (or similar) as type to prototype ... no
// TODO: last, check if instead use the class syntax ... probably no

// TODO: check if add another CloudEventCreateMinimal with only most common arguments ... no, with destructuring and default arguments it's no more needed

// TODO: add a function CloudEventValidator (event), but check how to return a list on errors ... wip
// TODO: add a function isCloudEventValid (event), that return a boolen value ... wip

/*
// TODO: uncomment later (used in the validator) ... wip
function ensureIsString (arg, name) {
  if (typeof arg !== 'string') {
    throw new TypeError(`The argument ${name}' must be a string, instead got a '${typeof arg}'`)
  }
}

// TODO: uncomment later (used in the validator) ... wip
function ensureIsStringNotEmpty (arg, name) {
  ensureIsString(arg, name)
  if (arg.length < 1) {
    throw new TypeError(`The string ${name}' must be not empty`)
  }
}
 */

module.exports = {
  mediaType: cloudEventMediaType,
  // CloudEventCreate: CloudEventCreateFull // TODO: remove ...
  CloudEventCreate: CloudEventCreateFast
}

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

const fp = require('fastify-plugin')
const cloudEventHandler = require('cloudevent.js') // get CloudEvent definition and related utilities

function fastifyCloudEvents (fastify, options, next) {
  const {
    serverUrl = '/',
    baseNamespace = 'com.github.fastify.plugins.fastify-cloudevents',
    onRequestCallback = null,
    preHandlerCallback = null,
    onSendCallback = null,
    onResponseCallback = null,
    onRouteCallback = null,
    onCloseCallback = null,
    onReadyCallback = null,
    /*
    // TODO: example default values; but then remove from here ... wip
    cloudEventOptions: {
      // cloudEventsVersion = '0.1', // it will be depretaced soon from here
      eventTypeVersion, // ok
      source = '/',
      eventTime = new Date(),
      extensions = null,
      contentType = 'application/json',
      schemaURL,  // TODO: handle this ...
      strict = false
    }
     */
    cloudEventOptions = {}
  } = options

  ensureIsString(serverUrl, 'serverUrl')
  ensureIsString(baseNamespace, 'baseNamespace')
  ensureIsFunction(onRequestCallback, 'onRequestCallback')
  ensureIsFunction(preHandlerCallback, 'preHandlerCallback')
  ensureIsFunction(onSendCallback, 'onSendCallback')
  ensureIsFunction(onResponseCallback, 'onResponseCallback')
  ensureIsFunction(onRouteCallback, 'onRouteCallback')
  ensureIsFunction(onCloseCallback, 'onCloseCallback')
  ensureIsFunction(onReadyCallback, 'onReadyCallback')

  const fastJson = require('fast-json-stringify')
  // define a schema for serializing a CloudEvent object to JSON
  // note that unspecified properties will be ignored (in json output)
  // if additionalProperties is false
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
    return serialized
  }

  // execute plugin code
  fastify.decorate('CloudEvent', cloudEventHandler)
  // TODO: remove decorators for functions already exported by cloudEventHandler ... ok
  // fastify.decorate('cloudEventIsValid', cloudEventHandler.isValidEvent)
  // fastify.decorate('cloudEventValidate', cloudEventHandler.validateEvent)
  // fastify.decorate('cloudEventSerialize', cloudEventHandler.serializeEvent)
  fastify.decorate('cloudEventSerializeFast', serialize)

  // check/finish to setup cloudEventOptions
  const { version } = require('../package.json') // get plugin version
  // then set as eventTypeVersion if not already specified, could be useful
  if (cloudEventOptions.eventTypeVersion === null || typeof cloudEventOptions.eventTypeVersion !== 'string') {
    cloudEventOptions.eventTypeVersion = version
  }

  // handle hooks, only when related callback are defined
  if (onRequestCallback !== null) {
    fastify.addHook('onRequest', (req, res, next) => {
      // TODO: add hook-specific id and data, and test it later ... wip
      const ce = new fastify.CloudEvent('id',
        `${baseNamespace}.onRequest`,
        null, // data
        cloudEventOptions
      )
      // console.log(`DEBUG - onRequest: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      // send the event to the callback
      onRequestCallback(ce)

      next()
    })
  }

  if (preHandlerCallback !== null) {
    fastify.addHook('preHandler', (req, reply, next) => {
      // TODO: add hook-specific id and data, and test it later ... wip
      const ce = new fastify.CloudEvent('id',
        `${baseNamespace}.preHandler`,
        null, // data
        cloudEventOptions
      )
      // console.log(`DEBUG - preHandler: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      preHandlerCallback(ce)

      next()
    })
  }

  if (onSendCallback !== null) {
    fastify.addHook('onSend', (req, reply, payload, next) => {
      // TODO: add hook-specific id and data, and test it later ... wip
      const ce = new fastify.CloudEvent('id',
        `${baseNamespace}.onSend`,
        null, // data
        cloudEventOptions
      )
      // console.log(`DEBUG - onSend: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      onSendCallback(ce)

      next()
    })
  }

  if (onResponseCallback !== null) {
    fastify.addHook('onResponse', (res, next) => {
      // TODO: add hook-specific id and data, and test it later ... wip
      const ce = new fastify.CloudEvent('id',
        `${baseNamespace}.onResponse`,
        null, // data
        cloudEventOptions
      )
      // console.log(`DEBUG - onResponse: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      onResponseCallback(ce)

      next()
    })
  }

  if (onRouteCallback !== null) {
    fastify.addHook('onRoute', (routeOptions) => {
      // TODO: add hook-specific http method and url, and test it later ... wip
      // TODO: add hook-specific id and data, and test it later ... wip
      const ce = new fastify.CloudEvent('id',
        `${baseNamespace}.onRoute`,
        null, // data
        cloudEventOptions
      )
      // console.log(`DEBUG - onRoute: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      onRouteCallback(ce)
    })
  }

  if (onCloseCallback !== null) {
    // hook to plugin shutdown, not server
    fastify.addHook('onClose', (instance, done) => {
      // TODO: add hook-specific id and data, and test it later ... wip
      const ce = new fastify.CloudEvent('id',
        `${baseNamespace}.onClose`,
        null, // data
        cloudEventOptions
      )
      // console.log(`DEBUG - onClose: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      onCloseCallback(ce)

      done()
    })
  }

  if (onReadyCallback !== null) {
    // hook to plugin successful starup, not server
    // TODO: add hook-specific id and data, and test it later ... wip
    const ce = new fastify.CloudEvent('id',
      `${baseNamespace}.ready`,
      null, // data
      cloudEventOptions
    )
    // console.log(`DEBUG - ready: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
    fastify.ready(onReadyCallback(ce))
  }

  next()
}

function ensureIsString (arg, name) {
  if (arg !== null && typeof arg !== 'string') {
    throw new TypeError(`The argument '${name}' must be a string, instead got a '${typeof arg}'`)
  }
}

function ensureIsFunction (arg, name) {
  if (arg !== null && typeof arg !== 'function') {
    throw new TypeError(`The argument '${name}' must be a function, instead got a '${typeof arg}'`)
  }
}

module.exports = fp(fastifyCloudEvents, {
  fastify: '>=0.43.0',
  name: 'fastify-cloudevents'
})

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
    idGenerator = idMaker(),
    onRequestCallback = null,
    preHandlerCallback = null,
    onSendCallback = null,
    onResponseCallback = null,
    onRouteCallback = null,
    onCloseCallback = null,
    onReadyCallback = null,
    cloudEventOptions = {}
  } = options

  ensureIsString(serverUrl, 'serverUrl')
  ensureIsString(baseNamespace, 'baseNamespace')
  ensureIsObject(idGenerator, 'idGenerator')
  ensureIsFunction(onRequestCallback, 'onRequestCallback')
  ensureIsFunction(preHandlerCallback, 'preHandlerCallback')
  ensureIsFunction(onSendCallback, 'onSendCallback')
  ensureIsFunction(onResponseCallback, 'onResponseCallback')
  ensureIsFunction(onRouteCallback, 'onRouteCallback')
  ensureIsFunction(onCloseCallback, 'onCloseCallback')
  ensureIsFunction(onReadyCallback, 'onReadyCallback')

  const fastJson = require('fast-json-stringify')
  // define a schema for serializing a CloudEvent object to JSON
  // note that properties not in the schema will be ignored
  // (in json output) if additionalProperties is false
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
    // raise error if contentType is not the default one (for now), for consistency with CloudEvents library used ...
    if (event.contentType !== 'application/json') {
      throw new Error(`Unsupported content type: '${event.contentType}'. Not yet implemented.`)
    }

    // TODO: handle even non default contentType when serializing the data attribute ... wip
    const serialized = stringify(event)
    // console.log(`DEBUG - serialize: serialized = '${serialized}'`)
    return serialized
  }

  // execute plugin code
  fastify.decorate('CloudEvent', cloudEventHandler)
  fastify.decorate('cloudEventSerializeFast', serialize)

  // check/finish to setup cloudEventOptions
  const pluginVersion = require('../package.json').version // get plugin version
  // then set as eventTypeVersion if not already specified, could be useful
  if (cloudEventOptions.eventTypeVersion === null || typeof cloudEventOptions.eventTypeVersion !== 'string') {
    cloudEventOptions.eventTypeVersion = pluginVersion
  }
  // override source if not already specified
  if (cloudEventOptions.source === null || typeof cloudEventOptions.source !== 'string') {
    cloudEventOptions.source = serverUrl
  }

  // handle hooks, only when related callback are defined
  if (onRequestCallback !== null) {
    fastify.addHook('onRequest', (req, res, next) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onRequest`,
        {
          id: req.id,
          timestamp: Math.floor(Date.now()),
          req: {
            httpVersion: req.httpVersion,
            id: req.id,
            headers: req.headers,
            method: req.method,
            originalUrl: req.originalUrl,
            upgrade: req.upgrade,
            url: req.url
          },
          res: { }
        }, // data
        cloudEventOptions
      )
      // console.log(`DEBUG - onRequest: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      // send the event to the callback
      onRequestCallback(ce)

      next()
    })
  }

  if (preHandlerCallback !== null) {
    fastify.addHook('preHandler', (request, reply, next) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.preHandler`,
        {
          id: request.id,
          timestamp: Math.floor(Date.now()),
          request: {
            id: request.id,
            headers: request.headers,
            params: request.params,
            query: request.query,
            body: request.body,
            method: request.req.method,
            url: request.req.url
          },
          reply: {
            statusCode: reply.res.statusCode,
            statusMessage: reply.res.statusMessage,
            sent: reply.sent
          }
        }, // data
        cloudEventOptions
      )
      preHandlerCallback(ce)

      next()
    })
  }

  if (onSendCallback !== null) {
    fastify.addHook('onSend', (request, reply, payload, next) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onSend`,
        {
          id: request.id,
          timestamp: Math.floor(Date.now()),
          request: {
            id: request.id,
            headers: request.headers,
            params: request.params,
            query: request.query,
            body: request.body,
            method: request.req.method,
            url: request.req.url
          },
          reply: {
            statusCode: reply.res.statusCode,
            statusMessage: reply.res.statusMessage,
            sent: reply.sent
          },
          payload: { }
        }, // data
        cloudEventOptions
      )
      onSendCallback(ce)

      next()
    })
  }

  if (onResponseCallback !== null) {
    fastify.addHook('onResponse', (res, next) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onResponse`,
        {
          // id: res.id, // not available
          timestamp: Math.floor(Date.now()),
          res: {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            finished: res.finished
          }
        }, // data
        cloudEventOptions
      )
      onResponseCallback(ce)

      next()
    })
  }

  if (onRouteCallback !== null) {
    fastify.addHook('onRoute', (routeOptions) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onRoute`,
        routeOptions, // data
        cloudEventOptions
      )
      onRouteCallback(ce)
    })
  }

  if (onCloseCallback !== null) {
    // hook to plugin shutdown, not server
    fastify.addHook('onClose', (instance, done) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onClose`,
        {
          timestamp: Math.floor(Date.now()),
          description: 'plugin shutdown'
        }, // data
        cloudEventOptions
      )
      onCloseCallback(ce)

      done()
    })
  }

  if (onReadyCallback !== null) {
    // hook to plugin successful startup, not server
    const ce = new fastify.CloudEvent(idGenerator.next().value,
      `${baseNamespace}.ready`,
      {
        timestamp: Math.floor(Date.now()),
        description: 'plugin startup successfully',
        version: pluginVersion
      }, // data
      cloudEventOptions
    )
    fastify.ready(onReadyCallback(ce))
  }

  next()
}

function ensureIsString (arg, name) {
  if (arg !== null && typeof arg !== 'string') {
    throw new TypeError(`The argument '${name}' must be a string, instead got a '${typeof arg}'`)
  }
}

function ensureIsObject (arg, name) {
  if (arg !== null && typeof arg !== 'object') {
    throw new TypeError(`The argument '${name}' must be a object, instead got a '${typeof arg}'`)
  }
}

function ensureIsFunction (arg, name) {
  if (arg !== null && typeof arg !== 'function') {
    throw new TypeError(`The argument '${name}' must be a function, instead got a '${typeof arg}'`)
  }
}

const hostname = require('os').hostname()
const idPrefix = `fastify@${hostname}`
function * idMaker () {
  while (true) {
    const timestamp = Math.floor(Date.now())
    yield `${idPrefix}@${timestamp}`
  }
}

module.exports = fp(fastifyCloudEvents, {
  fastify: '1.x',
  name: 'fastify-cloudevents'
})

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
const cloudEventHandler = require('cloudevent') // get CloudEvent definition and related utilities

function fastifyCloudEvents (fastify, options, next) {
  const {
    serverUrl = '/',
    serverUrlMode = null,
    baseNamespace = 'com.github.fastify.plugins.fastify-cloudevents',
    idGenerator = idMaker(),
    includeHeaders = false,
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
  ensureIsString(serverUrlMode, 'serverUrlMode')
  ensureIsString(baseNamespace, 'baseNamespace')
  ensureIsObject(idGenerator, 'idGenerator')
  ensureIsBoolean(includeHeaders, 'includeHeaders')
  ensureIsFunction(onRequestCallback, 'onRequestCallback')
  ensureIsFunction(preHandlerCallback, 'preHandlerCallback')
  ensureIsFunction(onSendCallback, 'onSendCallback')
  ensureIsFunction(onResponseCallback, 'onResponseCallback')
  ensureIsFunction(onRouteCallback, 'onRouteCallback')
  ensureIsFunction(onCloseCallback, 'onCloseCallback')
  ensureIsFunction(onReadyCallback, 'onReadyCallback')

  const fastJson = require('fast-json-stringify')
  // get a schema for serializing a CloudEvent object to JSON
  // note that properties not in the schema will be ignored
  // (in json output) if additionalProperties is false
  const ceSchema = require('../../cloudevent.js/src/').getJSONSchema() // temp, reference the library via a local relative path ...
  // const ceSchema = cloudEventHandler.getJSONSchema() // TODO: remove the previous line and uncomment this ... wip
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
    // TODO: for example add an optional argument in the method for already serialized data, then merge it in a new object in the stringify call ... wip
    const serialized = stringify(event)
    // console.log(`DEBUG - serialize: serialized = '${serialized}'`)
    return serialized
  }

  /**
   * Build the value for the source field of the CloudEvent,
   * depending on the plugin configuration of options
   * `serverUrlMode`, `serverUrl`,
   * and the uri part of the current request.
   * Note that this is mainly for usage inside the plugin,
   * but in some cases could be useful even outside.
   *
   * @param {string} url the uri part of the current request
   * @return {string} the source value to use, as a string
   */
  function buildSourceUrl (url = '') {
    if (serverUrlMode === null || serverUrlMode === 'pluginAndRequestUrl') {
      return serverUrl + url
    } else if (serverUrlMode === 'pluginServerUrl') {
      return serverUrl
    } else if (serverUrlMode === 'requestUrl') {
      return url
    } else {
      throw new Error(`Illegal value for serverUrlMode: '${serverUrlMode}'`)
    }
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
  // add to extensions the serverUrlMode defined, if set
  if (serverUrlMode !== null) {
    cloudEventOptions.extensions = cloudEventOptions.extensions || {}
    cloudEventOptions.extensions.serverUrlMode = serverUrlMode
  }

  // handle hooks, only when related callback are defined
  if (onRequestCallback !== null) {
    fastify.addHook('onRequest', (req, res, next) => {
      const headers = (includeHeaders === null || includeHeaders === false) ? null : req.headers
      const sourceUrl = buildSourceUrl(req.url)
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onRequest`,
        sourceUrl,
        {
          id: req.id,
          timestamp: Math.floor(Date.now()),
          req: {
            httpVersion: req.httpVersion,
            id: req.id,
            headers: headers,
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
      const headers = (includeHeaders === null || includeHeaders === false) ? null : request.headers
      const sourceUrl = buildSourceUrl(request.req.url)
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.preHandler`,
        sourceUrl,
        {
          id: request.id,
          timestamp: Math.floor(Date.now()),
          request: {
            id: request.id,
            headers: headers,
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
      const headers = (includeHeaders === null || includeHeaders === false) ? null : request.headers
      const sourceUrl = buildSourceUrl(request.req.url)
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onSend`,
        sourceUrl,
        {
          id: request.id,
          timestamp: Math.floor(Date.now()),
          request: {
            id: request.id,
            headers: headers,
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
      const sourceUrl = buildSourceUrl()
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onResponse`,
        sourceUrl,
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
      const sourceUrl = buildSourceUrl()
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onRoute`,
        sourceUrl,
        routeOptions, // data
        cloudEventOptions
      )
      onRouteCallback(ce)
    })
  }

  if (onCloseCallback !== null) {
    // hook to plugin shutdown, not server
    fastify.addHook('onClose', (instance, done) => {
      const sourceUrl = buildSourceUrl()
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onClose`,
        sourceUrl,
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
    const sourceUrl = buildSourceUrl()
    const ce = new fastify.CloudEvent(idGenerator.next().value,
      `${baseNamespace}.ready`,
      sourceUrl,
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

function ensureIsBoolean (arg, name) {
  if (arg !== null && typeof arg !== 'boolean') {
    throw new TypeError(`The argument '${name}' must be a boolean, instead got a '${typeof arg}'`)
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
  fastify: '^1.1.0',
  name: 'fastify-cloudevents'
})

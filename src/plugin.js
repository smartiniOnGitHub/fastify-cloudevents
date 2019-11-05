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
const { CloudEvent, CloudEventTransformer, JSONBatch } = require('cloudevent') // get CloudEvent definition and related utilities

const pluginName = require('../package.json').name // get plugin name
const pluginVersion = require('../package.json').version // get plugin version

function fastifyCloudEvents (fastify, options, done) {
  const {
    serverUrl = '/',
    serverUrlMode = null,
    baseNamespace = `com.github.fastify.plugins.${pluginName}-v${pluginVersion}`,
    idGenerator = idMaker(),
    includeHeaders = false,
    includeHttpAttributes = false,
    includeRedundantAttributes = false,
    onRequestCallback = null,
    preParsingCallback = null,
    preValidationCallback = null,
    preHandlerCallback = null,
    preSerializationCallback = null,
    onErrorCallback = null,
    onSendCallback = null,
    onResponseCallback = null,
    onCloseCallback = null,
    onRouteCallback = null,
    onRegisterCallback = null,
    onReadyCallback = null,
    cloudEventOptions = {},
    cloudEventExtensions = null
  } = options

  ensureIsString(serverUrl, 'serverUrl')
  ensureIsString(serverUrlMode, 'serverUrlMode')
  ensureIsString(baseNamespace, 'baseNamespace')
  ensureIsObject(idGenerator, 'idGenerator')
  ensureIsBoolean(includeHeaders, 'includeHeaders')
  ensureIsBoolean(includeHttpAttributes, 'includeHttpAttributes')
  ensureIsBoolean(includeRedundantAttributes, 'includeRedundantAttributes')
  ensureIsFunction(onRequestCallback, 'onRequestCallback')
  ensureIsFunction(preParsingCallback, 'preParsingCallback')
  ensureIsFunction(preValidationCallback, 'preValidationCallback')
  ensureIsFunction(preHandlerCallback, 'preHandlerCallback')
  ensureIsFunction(preSerializationCallback, 'preSerializationCallback')
  ensureIsFunction(onErrorCallback, 'onErrorCallback')
  ensureIsFunction(onSendCallback, 'onSendCallback')
  ensureIsFunction(onResponseCallback, 'onResponseCallback')
  ensureIsFunction(onCloseCallback, 'onCloseCallback')
  ensureIsFunction(onRouteCallback, 'onRouteCallback')
  ensureIsFunction(onRegisterCallback, 'onRegisterCallback')
  ensureIsFunction(onReadyCallback, 'onReadyCallback')
  ensureIsObjectPlain(cloudEventOptions, 'cloudEventOptions')
  ensureIsObjectPlain(cloudEventExtensions, 'cloudEventExtensions')

  const fastJson = require('fast-json-stringify')
  // get a schema for serializing a CloudEvent object to JSON
  // note that properties not in the schema will be ignored
  // (in json output) if additionalProperties is false
  const ceSchema = CloudEvent.getJSONSchema()
  const stringify = fastJson(ceSchema)

  /**
   * Serialize the given CloudEvent in JSON format.
   *
   * @param {!object} event the CloudEvent to serialize
   * @param {object} [options={}] optional serialization attributes:
   *        encoder (function, no default) a function that takes data and returns encoded data,
   *        encodedData (string, no default) already encoded data (but consistency with the datacontenttype is not checked),
   *        onlyValid (boolean, default false) to serialize only if it's a valid instance,
   * @return {string} the serialized event, as a string
   * @throws {Error} if event is undefined or null, or an option is undefined/null/wrong
   * @throws {Error} if onlyValid is true, and the given event is not a valid CloudEvent instance
   */
  function serialize (event, { encoder, encodedData, onlyValid = false } = {}) {
    ensureIsObjectPlain(event, 'event')

    if (event.datacontenttype === CloudEvent.datacontenttypeDefault()) {
      if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(event) === true)) {
        return stringify(event)
      } else {
        throw new Error('Unable to serialize a not valid CloudEvent.')
      }
    }
    // else
    if (encoder !== undefined && encoder !== null) {
      if (typeof encoder !== 'function') {
        throw new Error(`Missing or wrong encoder function: '${encoder}' for the given content type: '${event.datacontenttype}'.`)
      }
      encodedData = encoder(event.payload)
    } else {
      // encoder not defined, check encodedData
      if (encodedData === undefined || encodedData === null) {
        throw new Error(`Missing encoder function: use encoder function or already encoded data with the given content type: '${event.datacontenttype}'.`)
      }
    }
    if (typeof encodedData !== 'string') {
      throw new Error(`Missing or wrong encoded data: '${encodedData}' for the given content type: '${event.datacontenttype}'.`)
    }
    const newEvent = CloudEventTransformer.mergeObjects(event, { data: encodedData })
    // console.log(`DEBUG - new event details: ${CloudEventTransformer.dumpObject(newEvent, 'newEvent')}`)
    if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(newEvent) === true)) {
      return stringify(newEvent)
    } else {
      throw new Error('Unable to serialize a not valid CloudEvent.')
    }
  }

  // execute plugin code
  fastify.decorate('CloudEvent', CloudEvent)
  fastify.decorate('CloudEventTransformer', CloudEventTransformer)
  fastify.decorate('JSONBatch', JSONBatch)
  fastify.decorate('cloudEventSerializeFast', serialize)

  // add to extensions the serverUrlMode defined, if set
  if (serverUrlMode !== null && cloudEventExtensions !== null) {
    cloudEventExtensions.com_github_smartiniOnGitHub_fastifycloudevents = {}
    cloudEventExtensions.com_github_smartiniOnGitHub_fastifycloudevents.serverUrlMode = serverUrlMode
  }

  // references builders, configured with some plugin options
  const builders = require('./builder')({
    pluginName,
    pluginVersion,
    serverUrl,
    serverUrlMode,
    baseNamespace,
    idGenerator,
    includeHeaders,
    includeRedundantAttributes,
    cloudEventOptions,
    cloudEventExtensions
  })

  // handle hooks, only when related callback are defined
  if (onRequestCallback !== null) {
    fastify.addHook('onRequest', (request, reply, done) => {
      // small optimization: pass a null reply because no useful here
      const ce = builders.buildCloudEventForHook('onRequest', request, null)
      // add some http related attributes to data, could be useful to have
      if (includeHttpAttributes !== null && includeHttpAttributes === true) {
        ce.data.request.httpVersion = request.req.httpVersion
        ce.data.request.originalUrl = request.req.originalUrl
        ce.data.request.upgrade = request.req.upgrade
      }
      // console.log(`DEBUG - onRequest: created CloudEvent ${CloudEventTransformer.dumpObject(ce, 'ce')}`)
      // send the event to the callback
      onRequestCallback(ce)

      done()
    })
  }

  if (preParsingCallback !== null) {
    fastify.addHook('preParsing', (request, reply, done) => {
      const ce = builders.buildCloudEventForHook('preParsing', request, reply)
      preParsingCallback(ce)

      done()
    })
  }

  if (preValidationCallback !== null) {
    fastify.addHook('preValidation', (request, reply, done) => {
      const ce = builders.buildCloudEventForHook('preValidation', request, reply)
      preValidationCallback(ce)

      done()
    })
  }

  if (preHandlerCallback !== null) {
    fastify.addHook('preHandler', (request, reply, done) => {
      const ce = builders.buildCloudEventForHook('preHandler', request, reply)
      preHandlerCallback(ce)

      done()
    })
  }

  if (preSerializationCallback !== null) {
    fastify.addHook('preSerialization', (request, reply, payload, done) => {
      const ce = builders.buildCloudEventForHook('preSerialization', request, reply, payload)
      preSerializationCallback(ce)

      done()
    })
  }

  if (onErrorCallback !== null) {
    fastify.addHook('onError', (request, reply, error, done) => {
      const processInfoAsData = CloudEventTransformer.processInfoToData()
      const errorAsData = CloudEventTransformer.errorToData(error, {
        includeStackTrace: true,
        addStatus: true,
        addTimestamp: true
      })
      const ceData = {
        request: builders.buildRequestDataForCE(request),
        reply: builders.buildReplyDataForCE(reply),
        error: errorAsData,
        process: processInfoAsData
      }
      if (includeRedundantAttributes !== null && includeRedundantAttributes === true) {
        ceData.id = request.id
        ceData.timestamp = CloudEventTransformer.timestampToNumber()
      }
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onError`,
        builders.buildSourceUrl(request.url),
        ceData,
        cloudEventOptions,
        cloudEventExtensions
      )
      onErrorCallback(ce)

      done() // do not pass the error to the done callback here
    })
  }

  if (onSendCallback !== null) {
    fastify.addHook('onSend', (request, reply, payload, done) => {
      const ce = builders.buildCloudEventForHook('onSend', request, reply, payload)
      onSendCallback(ce)

      done()
    })
  }

  if (onResponseCallback !== null) {
    fastify.addHook('onResponse', (request, reply, done) => {
      const ce = builders.buildCloudEventForHook('onResponse', request, reply)
      // keep the request attribute from data, even if more data will be shown here
      onResponseCallback(ce)

      done()
    })
  }

  if (onCloseCallback !== null) {
    // hook to plugin shutdown, not server
    fastify.addHook('onClose', (instance, done) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onClose`,
        builders.buildSourceUrl(),
        builders.buildPluginDataForCE('plugin shutdown'), // data
        cloudEventOptions,
        cloudEventExtensions
      )
      onCloseCallback(ce)

      done()
    })
  }

  if (onRouteCallback !== null) {
    fastify.addHook('onRoute', (routeOptions) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onRoute`,
        builders.buildSourceUrl(),
        routeOptions, // data
        cloudEventOptions,
        cloudEventExtensions
      )
      onRouteCallback(ce)
    })
  }

  if (onRegisterCallback !== null) {
    fastify.addHook('onRegister', (instance) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onRegister`,
        builders.buildSourceUrl(),
        builders.buildPluginDataForCE('plugin registration'), // data
        cloudEventOptions,
        cloudEventExtensions
      )
      onRegisterCallback(ce)
    })
  }

  if (onReadyCallback !== null) {
    // hook to plugin successful startup, not server
    const ce = new fastify.CloudEvent(idGenerator.next().value,
      `${baseNamespace}.ready`,
      builders.buildSourceUrl(),
      builders.buildPluginDataForCE('plugin startup successfully'), // data
      cloudEventOptions,
      cloudEventExtensions
    )
    fastify.ready(onReadyCallback(ce))
  }

  done()
}

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

const hostname = require('os').hostname()
const idPrefix = `fastify@${hostname}`
function * idMaker () {
  while (true) {
    const timestamp = CloudEventTransformer.timestampToNumber()
    yield `${idPrefix}@${timestamp}`
  }
}

module.exports = fp(fastifyCloudEvents, {
  fastify: '^2.7.1',
  name: 'fastify-cloudevents'
})

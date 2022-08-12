/*
 * Copyright 2018-2022 the original author or authors.
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

async function fastifyCloudEvents (fastify, options) {
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
  // remove the definition of data, or it won't be managed in the right way
  delete ceSchema.properties.data
  // remove the definition of time, or it won't be managed in the right way
  // delete ceSchema.properties.time // no more needed now that time is set as a string
  // add additionalProperties, to let serialization export properties not in schema
  // ceSchema.additionalProperties = true // already in schema, so no need to add here
  // compile schema and return the serialization function to use
  const stringify = fastJson(ceSchema)

  /**
   * Serialize the given CloudEvent in JSON format.
   *
   * @param {!object} event the CloudEvent to serialize
   * @param {object} [options={}] optional serialization attributes:
   *        - encoder (function, no default) a function that takes data and returns encoded data as a string,
   *        - encodedData (string, no default) already encoded data (but consistency with the datacontenttype is not checked),
   *        - onlyValid (boolean, default false) to serialize only if it's a valid instance,
   *        - printDebugInfo (boolean, default false) to print some debug info to the console,
   *        - timezoneOffset (number, default 0) to apply a different timezone offset
   *        See {@link CloudEvent} and its [static method serializeEvent]{@link CloudEvent#serializeEvent} for similar options.
   * @return {string} the serialized event, as a string
   * @throws {Error} if event is undefined or null, or an option is undefined/null/wrong
   * @throws {Error} if onlyValid is true, and the given event is not a valid CloudEvent instance
   */
  function serialize (event, {
    encoder, encodedData,
    onlyValid = false,
    printDebugInfo = false,
    timezoneOffset = 0
  } = {}) {
    ensureIsObjectPlain(event, 'event')
    if (printDebugInfo === true) {
      console.log(`DEBUG | trying to serialize ce: ${JSON.stringify(event)}`)
    }

    if (event.datacontenttype === CloudEvent.datacontenttypeDefault()) {
      if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(event, { timezoneOffset }) === true)) {
        const ser = stringify(event)
        if (printDebugInfo === true) {
          console.log(`DEBUG | ce successfully serialized as: ${ser}`)
        }
        return ser
      } else {
        throw new Error('Unable to serialize a not valid CloudEvent.')
      }
    }
    // else (non defaut datacontenttype)
    if (encoder !== undefined && encoder !== null) {
      if (typeof encoder !== 'function') {
        throw new Error(`Missing or wrong encoder function: '${encoder}' for the given content type: '${event.datacontenttype}'.`)
      }
      encodedData = encoder(event.payload)
    } else {
      // encoder not defined, check encodedData
      // but mandatory only for non-value data
      if (!isValue(event.data) && !isDefinedAndNotNull(encodedData)) {
        throw new Error(`Missing encoder function: use encoder function or already encoded data with the given data content type: '${event.datacontenttype}'.`)
      }
      if (isValue(event.data) && !isDefinedAndNotNull(encodedData)) {
        encodedData = `${event.data}`
      }
    }
    if (typeof encodedData !== 'string') {
      throw new Error(`Missing or wrong encoded data: '${encodedData}' for the given content type: '${event.datacontenttype}'.`)
    }
    const newEvent = CloudEventTransformer.mergeObjects(event, { data: encodedData })
    // console.log(`DEBUG - new event details: ${CloudEventTransformer.dumpObject(newEvent, 'newEvent')}`)
    if ((onlyValid === false) || (onlyValid === true && CloudEvent.isValidEvent(newEvent, { timezoneOffset }) === true)) {
      const ser = stringify(newEvent)
      if (printDebugInfo === true) {
        console.log(`DEBUG | ce successfully serialized as: ${ser}`)
      }
      return ser
    } else {
      throw new Error('Unable to serialize a not valid CloudEvent.')
    }
  }

  // use 'ajv' (dependency of fast-json-stringify')
  const Ajv = require('ajv')
  const addFormats = require('ajv-formats')
  // define some default options for Ajv
  const defaultAjvValidationOptions = {
    coerceTypes: true,
    removeAdditional: true
  }
  // create a default instance for Ajv and related schema validator
  const defaultAjv = new Ajv(defaultAjvValidationOptions)
  addFormats(defaultAjv)
  const defaultAjvValidateFromSchema = defaultAjv.compile(ceSchema)

  /**
   * Validate the given CloudEvent with the schema compiler already instanced.
   *
   * @param {!object} event the CloudEvent to validate
   * @param {object} [options=null] Ajv validation options, see {@link https://ajv.js.org/options.html|Options - AJV Validator}
   * @return {object} validation results: 'valid' boolean and 'errors' as array of strings or null
   * @throws {Error} if event is undefined or null
   */
  function validate (event, options = null) {
    ensureIsObjectPlain(event, 'event')

    // depending on options given, it will be used a new Ajv instance
    // or one already created with default settings, to speedup validation
    let ajv = defaultAjv
    let validateFromSchema = defaultAjvValidateFromSchema
    if (options !== null) {
      ajv = new Ajv(options)
      addFormats(ajv)
      validateFromSchema = ajv.compile(ceSchema)
    }

    const isValid = validateFromSchema(event)
    return {
      valid: isValid,
      errors: validateFromSchema.errors
    }
  }

  // execute plugin code
  fastify.decorate('CloudEvent', CloudEvent)
  fastify.decorate('CloudEventTransformer', CloudEventTransformer)
  fastify.decorate('JSONBatch', JSONBatch)
  fastify.decorate('cloudEventJSONSchema', ceSchema)
  fastify.decorate('cloudEventSerializeFast', serialize)
  fastify.decorate('cloudEventValidateFast', validate)

  // add to extensions the serverUrlMode defined, if set
  if (serverUrlMode !== null && cloudEventExtensions !== null) {
    cloudEventExtensions.fastifyserverurlmode = serverUrlMode
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
    fastify.addHook('onRequest', async (request, reply) => {
      // small optimization: pass a null reply because no useful here
      const ce = builders.buildCloudEventForHook('onRequest', request, null)
      // add some http related attributes to data, could be useful to have
      if (includeHttpAttributes !== null && includeHttpAttributes === true) {
        ce.data.request.httpVersion = request.raw.httpVersion
        ce.data.request.originalUrl = request.raw.originalUrl
        ce.data.request.upgrade = request.raw.upgrade
      }
      // console.log(`DEBUG - onRequest: created CloudEvent ${CloudEventTransformer.dumpObject(ce, 'ce')}`)
      // send the event to the callback
      onRequestCallback(ce)
    })
  }

  if (preParsingCallback !== null) {
    fastify.addHook('preParsing', async (request, reply, payload) => {
      const ce = builders.buildCloudEventForHook('preParsing', request, reply, // payload)
        null) // do not pass payload here or a "Converting circular structure to JSON" will be raised if enabled ...
      preParsingCallback(ce)
    })
  }

  if (preValidationCallback !== null) {
    fastify.addHook('preValidation', async (request, reply) => {
      const ce = builders.buildCloudEventForHook('preValidation', request, reply)
      preValidationCallback(ce)
    })
  }

  if (preHandlerCallback !== null) {
    fastify.addHook('preHandler', async (request, reply) => {
      const ce = builders.buildCloudEventForHook('preHandler', request, reply)
      preHandlerCallback(ce)
    })
  }

  if (preSerializationCallback !== null) {
    fastify.addHook('preSerialization', async (request, reply, payload) => {
      const ce = builders.buildCloudEventForHook('preSerialization', request, reply, payload)
      preSerializationCallback(ce)
    })
  }

  if (onErrorCallback !== null) {
    fastify.addHook('onError', async (request, reply, error) => {
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
      // done() // do not pass the error to the done callback here
    })
  }

  if (onSendCallback !== null) {
    fastify.addHook('onSend', async (request, reply, payload) => {
      const ce = builders.buildCloudEventForHook('onSend', request, reply, payload)
      onSendCallback(ce)
    })
  }

  if (onResponseCallback !== null) {
    fastify.addHook('onResponse', async (request, reply) => {
      const ce = builders.buildCloudEventForHook('onResponse', request, reply)
      // keep the request attribute from data, even if more data will be shown here
      onResponseCallback(ce)
    })
  }

  if (onCloseCallback !== null) {
    // hook to plugin shutdown
    fastify.addHook('onClose', async (instance) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onClose`,
        builders.buildSourceUrl(),
        builders.buildPluginDataForCE('plugin shutdown'), // data
        cloudEventOptions,
        cloudEventExtensions
      )
      onCloseCallback(ce)
    })
  }

  if (onRouteCallback !== null) {
    fastify.addHook('onRoute', async (routeOptions) => {
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
    fastify.addHook('onRegister', async (instance, opts) => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onRegister`,
        builders.buildSourceUrl(),
        builders.buildPluginDataForCE(`plugin registration, with options: ${JSON.stringify(opts)}`), // data
        cloudEventOptions,
        cloudEventExtensions
      )
      onRegisterCallback(ce)
    })
  }

  if (onReadyCallback !== null) {
    // triggered before the server starts listening for requests
    fastify.addHook('onReady', async () => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onReady`,
        builders.buildSourceUrl(),
        builders.buildPluginDataForCE('plugin ready'), // data
        cloudEventOptions,
        cloudEventExtensions
      )
      onReadyCallback(ce)
    })
  }

  // done()
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

function isDefinedAndNotNull (arg) {
  return (arg !== undefined && arg !== null)
}

function isValue (arg) {
  return ((arg !== undefined && arg !== null) &&
    (typeof arg === 'string' || typeof arg === 'boolean' || (typeof arg === 'number' && !isNaN(arg)))
  )
}

module.exports = fp(fastifyCloudEvents, {
  fastify: '^4.0.1',
  name: 'fastify-cloudevents'
})

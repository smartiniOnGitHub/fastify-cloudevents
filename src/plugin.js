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
 * Plugin:
 * this module exports the plugin as an async function.
 * @module plugin
 */

const fp = require('fastify-plugin')
const { CloudEvent, CloudEventTransformer, JSONBatch } = require('cloudevent') // get CloudEvent definition and related utilities
const {
  ensureIsString,
  ensureIsBoolean,
  ensureIsObject,
  ensureIsObjectPlain,
  ensureIsFunction,
  idMaker,
  isDefinedAndNotNull,
  isValue
} = require('./utils')
const setupHooks = require('./plugin-hooks')

const pluginName = require('../package.json').name // get plugin name
const pluginVersion = require('../package.json').version // get plugin version

/**
 * Plugin implementation.
 * Note that it's an async function.
 *
 * @param {!object} fastify Fastify instance
 * @param {object} [options={}] plugin configuration options
 * <ul>
 *     <li>baseNamespace (string, default `com.github.fastify.plugins.${pluginName}-v${pluginVersion}`) as base namespace for events generated,</li>
 *     <li>cloudEventExtensions (object, default null) Extensions for events generated,</li>
 *     <li>cloudEventOptions (object, default empty) Options for events generated,</li>
 *     <li>idGenerator (function, default idMaker) to build ID for events generated,</li>
 *     <li>includeHeaders (boolean, default false) flag to enable adding HTTP request Headers in events generated,</li>
 *     <li>includeHttpAttributes (boolean, default false) flag to add some HTTP request attributes in events generated,</li>
 *     <li>includeRedundantAttributes (boolean, default false) flag to add some redundant attributes inside data in events generated,</li>
 *     <li>onCloseCallback (function, no default) callback function for the 'onClose' hook,</li>
 *     <li>onErrorCallback (function, no default) callback function for the 'onError' hook,</li>
 *     <li>onListenCallback (function, no default) callback function for the 'onListen' hook,</li>
 *     <li>onReadyCallback (function, no default) callback function for the 'onReady' hook,</li>
 *     <li>onRegisterCallback (function, no default) callback function for the 'onRegister' hook,</li>
 *     <li>onRequestAbortCallback (function, no default) callback function for the 'onRequestAbort' hook,</li>
 *     <li>onRequestCallback (function, no default) callback function for the 'onRequest' hook,</li>
 *     <li>onResponseCallback (function, no default) callback function for the 'onResponse' hook,</li>
 *     <li>onRouteCallback (function, no default) callback function for the 'onRoute' hook,</li>
 *     <li>onSendCallback (function, no default) callback function for the 'onSend' hook,</li>
 *     <li>onTimeoutCallback (function, no default) callback function for the 'onTimeout' hook,</li>
 *     <li>preHandlerCallback (function, no default) callback function for the 'preHandler' hook,</li>
 *     <li>preParsingCallback (function, no default) callback function for the 'preParsing' hook,</li>
 *     <li>preSerializationCallback (function, no default) callback function for the 'preSerialization' hook,</li>
 *     <li>preValidationCallback (function, no default) callback function for the 'preValidation' hook,</li>
 *     <li>serverUrl (string, default '/') used as base to calculate source URL in events generated,</li>
 *     <li>serverUrlMode (string, default null so 'pluginAndRequestSimplified'; other values: 'pluginAndRequestUrl', 'pluginServerUrl','requestUrl') specify the way to calculate source URL in events generated,</li>
 *     <li>See [README - cloudevent.js - GitHub]{@link https://github.com/smartiniOnGitHub/cloudevent.js/blob/master/README.md} for more info.</li>
 *     <li>For Hooks, see [Hooks - Fastify reference - GitHub]{@link https://github.com/fastify/fastify/blob/main/docs/Reference/Hooks.md} for more info.</li>
 * </ul>
 *
 * @namespace
 */
async function fastifyCloudEvents (fastify, options) {
  const {
    baseNamespace = `com.github.fastify.plugins.${pluginName}-v${pluginVersion}`,
    cloudEventExtensions = null,
    cloudEventOptions = {},
    idGenerator = idMaker(),
    includeHeaders = false,
    includeHttpAttributes = false,
    includeRedundantAttributes = false,
    onCloseCallback = null,
    onErrorCallback = null,
    onListenCallback = null,
    onReadyCallback = null,
    onRegisterCallback = null,
    onRequestAbortCallback = null,
    onRequestCallback = null,
    onResponseCallback = null,
    onRouteCallback = null,
    onSendCallback = null,
    onTimeoutCallback = null,
    preHandlerCallback = null,
    preParsingCallback = null,
    preSerializationCallback = null,
    preValidationCallback = null,
    serverUrl = '/',
    serverUrlMode = null
  } = options

  ensureIsObjectPlain(fastify, 'fastify')
  // ensureIsObjectPlain(options, 'options')

  ensureIsString(serverUrl, 'serverUrl')
  ensureIsString(serverUrlMode, 'serverUrlMode')
  ensureIsString(baseNamespace, 'baseNamespace')
  ensureIsObject(idGenerator, 'idGenerator')
  ensureIsBoolean(includeHeaders, 'includeHeaders')
  ensureIsBoolean(includeHttpAttributes, 'includeHttpAttributes')
  ensureIsBoolean(includeRedundantAttributes, 'includeRedundantAttributes')
  ensureIsFunction(onCloseCallback, 'onCloseCallback')
  ensureIsFunction(onErrorCallback, 'onErrorCallback')
  ensureIsFunction(onListenCallback, 'onListenCallback')
  ensureIsFunction(onReadyCallback, 'onReadyCallback')
  ensureIsFunction(onRegisterCallback, 'onRegisterCallback')
  ensureIsFunction(onRequestAbortCallback, 'onRequestAbortCallback')
  ensureIsFunction(onRequestCallback, 'onRequestCallback')
  ensureIsFunction(onResponseCallback, 'onResponseCallback')
  ensureIsFunction(onRouteCallback, 'onRouteCallback')
  ensureIsFunction(onSendCallback, 'onSendCallback')
  ensureIsFunction(onTimeoutCallback, 'onTimeoutCallback')
  ensureIsFunction(preHandlerCallback, 'preHandlerCallback')
  ensureIsFunction(preParsingCallback, 'preParsingCallback')
  ensureIsFunction(preSerializationCallback, 'preSerializationCallback')
  ensureIsFunction(preValidationCallback, 'preValidationCallback')
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
   * <ul>
   *     <li>encoder (function, no default) a function that takes data and returns encoded data as a string,</li>
   *     <li>encodedData (string, no default) already encoded data (but consistency with the datacontenttype is not checked),</li>
   *     <li>onlyValid (boolean, default false) to serialize only if it's a valid instance,</li>
   *     <li>printDebugInfo (boolean, default false) to print some debug info to the console,</li>
   *     <li>timezoneOffset (number, default 0) to apply a different timezone offset,</li>
   *     <li>See [CloudEvent]{@link https://github.com/smartiniOnGitHub/cloudevent.js/blob/master/src/cloudevent.js} and its [static method serializeEvent]{@link CloudEvent#serializeEvent} for similar options.</li>
   * </ul>
   * @return {string} the serialized event, as a string
   * @throws {Error} if event is undefined or null, or an option is undefined/null/wrong
   * @throws {Error} if onlyValid is true, and the given event is not a valid CloudEvent instance
   *
   * @inner
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
   * @return {object} object with validation results: 'valid' boolean and 'errors' as array of strings or null
   * @throws {Error} if event is undefined or null
   *
   * @inner
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

  // setup all hooks
  setupHooks(fastify, {
    builders,
    baseNamespace,
    idGenerator,
    cloudEventOptions,
    cloudEventExtensions,
    includeHttpAttributes,
    includeRedundantAttributes,
    onRequestAbortCallback,
    onRequestCallback,
    preParsingCallback,
    preValidationCallback,
    preHandlerCallback,
    preSerializationCallback,
    onErrorCallback,
    onSendCallback,
    onResponseCallback,
    onTimeoutCallback,
    onCloseCallback,
    onRouteCallback,
    onRegisterCallback,
    onReadyCallback,
    onListenCallback
  })

  // done()
}

module.exports = fp(fastifyCloudEvents, {
  fastify: '^5.0.0',
  name: 'fastify-cloudevents'
})

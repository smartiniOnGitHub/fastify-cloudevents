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
 * Plugin hooks setup module.
 * Handles all Fastify hooks registration for CloudEvents.
 * @module plugin
 */

const { CloudEventTransformer } = require('cloudevent')

/**
 * Setup and register all CloudEvent hooks with Fastify.
 *
 * @param {!object} fastify Fastify instance
 * @param {!object} options Hook configuration options
 * @param {!object} builders Builders configuration options
 *
 * @inner
 */
function setupHooks (fastify, options, builders) {
  const {
    baseNamespace = null,
    idGenerator = null,
    cloudEventOptions = null,
    cloudEventExtensions = null,
    includeHttpAttributes = false,
    includeRedundantAttributes = false,
    onRequestAbortCallback = null,
    onRequestCallback = null,
    preParsingCallback = null,
    preValidationCallback = null,
    preHandlerCallback = null,
    preSerializationCallback = null,
    onErrorCallback = null,
    onSendCallback = null,
    onResponseCallback = null,
    onTimeoutCallback = null,
    onCloseCallback = null,
    onRouteCallback = null,
    onRegisterCallback = null,
    onReadyCallback = null,
    onListenCallback = null
  } = options

  // handle hooks, only when related callback are defined
  // see [Hooks - Fastify reference - GitHub](https://github.com/fastify/fastify/blob/main/docs/Reference/Hooks.md)

  if (onRequestAbortCallback !== null) {
    fastify.addHook('onRequestAbort', async (request) => {
      // small optimization: pass a null reply because no useful here
      const ce = builders.buildCloudEventForHook('onRequestAbort', request, null)
      // add some http related attributes to data, could be useful to have
      if (includeHttpAttributes !== null && includeHttpAttributes === true) {
        ce.data.request.httpVersion = request.raw.httpVersion
        ce.data.request.originalUrl = request.raw.originalUrl
        ce.data.request.upgrade = request.raw.upgrade
      }
      // console.log(`DEBUG - onRequestAbort: created CloudEvent ${CloudEventTransformer.dumpObject(ce, 'ce')}`)
      // send the event to the callback
      await onRequestAbortCallback(ce)
    })
  }

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
      await onRequestCallback(ce)
    })
  }

  if (preParsingCallback !== null) {
    fastify.addHook('preParsing', async (request, reply, payload) => {
      const ce = builders.buildCloudEventForHook('preParsing', request, reply, // payload)
        null) // do not pass payload here or a "Converting circular structure to JSON" will be raised if enabled ...
      await preParsingCallback(ce)
    })
  }

  if (preValidationCallback !== null) {
    fastify.addHook('preValidation', async (request, reply) => {
      const ce = builders.buildCloudEventForHook('preValidation', request, reply)
      await preValidationCallback(ce)
    })
  }

  if (preHandlerCallback !== null) {
    fastify.addHook('preHandler', async (request, reply) => {
      const ce = builders.buildCloudEventForHook('preHandler', request, reply)
      await preHandlerCallback(ce)
    })
  }

  if (preSerializationCallback !== null) {
    fastify.addHook('preSerialization', async (request, reply, payload) => {
      const ce = builders.buildCloudEventForHook('preSerialization', request, reply, payload)
      await preSerializationCallback(ce)
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
      await onErrorCallback(ce)
      // done() // do not pass the error to the done callback here
    })
  }

  if (onSendCallback !== null) {
    fastify.addHook('onSend', async (request, reply, payload) => {
      const ce = builders.buildCloudEventForHook('onSend', request, reply, payload)
      await onSendCallback(ce)
    })
  }

  if (onResponseCallback !== null) {
    fastify.addHook('onResponse', async (request, reply) => {
      const ce = builders.buildCloudEventForHook('onResponse', request, reply)
      // keep the request attribute from data, even if more data will be shown here
      await onResponseCallback(ce)
    })
  }

  if (onTimeoutCallback !== null) {
    fastify.addHook('onTimeout', async (request, reply) => {
      const ce = builders.buildCloudEventForHook('onTimeout', request, reply)
      // keep the request attribute from data, even if more data will be shown here
      await onTimeoutCallback(ce)
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
      await onCloseCallback(ce)
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
    fastify.addHook('onRegister', (instance, opts) => {
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
      await onReadyCallback(ce)
    })
  }

  if (onListenCallback !== null) {
    // triggered when the server starts listening for requests
    fastify.addHook('onListen', async () => {
      const ce = new fastify.CloudEvent(idGenerator.next().value,
        `${baseNamespace}.onListen`,
        builders.buildSourceUrl(),
        builders.buildPluginDataForCE('server listening'), // data
        cloudEventOptions,
        cloudEventExtensions
      )
      await onListenCallback(ce)
    })
  }

  // done()
}

module.exports = setupHooks

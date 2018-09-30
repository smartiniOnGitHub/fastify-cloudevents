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
    // TODO: check how to pass cloudEventOptions here ... wip
    onRequestCallback = null,
    preHandlerCallback = null,
    onSendCallback = null,
    onResponseCallback = null,
    onRouteCallback = null,
    onCloseCallback = null
  } = options

  ensureIsString(serverUrl, 'serverUrl')
  ensureIsFunction(onRequestCallback, 'onRequestCallback')

  // execute plugin code
  fastify.decorate('CloudEvent', cloudEventHandler)
  fastify.decorate('cloudEventIsValid', cloudEventHandler.isValidEvent)
  fastify.decorate('cloudEventValidate', cloudEventHandler.validateEvent)
  fastify.decorate('cloudEventSerialize', cloudEventHandler.serializeEvent)

  if (onRequestCallback !== null) {
    fastify.addHook('onRequest', (req, res, next) => {
      // TODO: add hook-specific data, and test it later ... wip
      const ce = new fastify.CloudEvent()
      // console.log(`DEBUG - onRequest: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      // send the event to the callback
      onRequestCallback(ce)

      next()
    })
  }

  if (preHandlerCallback !== null) {
    fastify.addHook('preHandler', (req, reply, next) => {
      // TODO: add hook-specific data, and test it later ... wip
      const ce = new fastify.CloudEvent()
      console.log(`DEBUG - preHandler: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      preHandlerCallback(ce)

      next()
    })
  }

  if (onSendCallback !== null) {
    fastify.addHook('onSend', (req, reply, payload, next) => {
      // TODO: add hook-specific data, and test it later ... wip
      const ce = new fastify.CloudEvent()
      console.log(`DEBUG - onSend: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      onSendCallback(ce)

      next()
    })
  }

  if (onResponseCallback !== null) {
    fastify.addHook('onResponse', (res, next) => {
      // TODO: add hook-specific data, and test it later ... wip
      const ce = new fastify.CloudEvent()
      console.log(`DEBUG - onResponse: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      onResponseCallback(ce)

      next()
    })
  }

  if (onRouteCallback !== null) {
    fastify.addHook('onRoute', (routeOptions) => {
      // TODO: add hook-specific data, and test it later ... wip
      const ce = new fastify.CloudEvent()
      console.log(`DEBUG - onRoute: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      onRouteCallback(ce)
    })
  }

  if (onCloseCallback !== null) {
    fastify.addHook('onClose', (instance, done) => {
      // TODO: add hook-specific data, and test it later ... wip
      const ce = new fastify.CloudEvent()
      console.log(`DEBUG - onClose: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      onCloseCallback(ce)

      done()
    })
  }

  // TODO: other events: fastify.ready (if good to have here) ...

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

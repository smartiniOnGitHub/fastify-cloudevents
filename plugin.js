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
    onRequestCallback = null
    // TODO: check how to pass cloudEventOptions here ... wip
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
      // TODO: add route-specific data, and test it later ... wip
      const ce = new fastify.CloudEvent()
      // console.log(`DEBUG - onRequest: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
      // send the event to the callback
      onRequestCallback(ce)

      next()
    })
  }

  /*
  // TODO: enable later ...
  fastify.addHook('preHandler', (request, reply, next) => {
    // TODO: ...
    next()
  })

  fastify.addHook('onSend', (request, reply, payload, next) => {
    // TODO: ...
    next()
  })

  fastify.addHook('onResponse', (res, next) => {
    // TODO: ...
    next()
  })

  // TODO: other hooks ...
   */

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

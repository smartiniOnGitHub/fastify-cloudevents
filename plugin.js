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

const cloudEventHandler = require('./cloudevent.js') // get CloudEvent definition and related utilities

function fastifyCloudEvents (fastify, { // options
  serverUrl = '/'
}, next) {
  if (typeof serverUrl !== 'string') {
    throw new TypeError(`The option serverUrl must be a string, instead got a '${typeof serverUrl}'`)
  }

  // execute plugin code
  fastify.decorate('CloudEventCreate', cloudEventHandler.CloudEventCreate)
  fastify.decorate('isCloudEventValid', cloudEventHandler.isCloudEventValid)
  fastify.decorate('cloudEventValidation', cloudEventHandler.cloudEventValidation)
  fastify.decorate('cloudEventSerialization', cloudEventHandler.cloudEventSerialization)

  next()
}

module.exports = fp(fastifyCloudEvents, {
  fastify: '>=0.43.0',
  name: 'fastify-cloudevents'
})

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

const fastify = require('fastify')()

fastify.register(require('../plugin'), {
  serverUrl: 'localhost:3000/',
  onRequestCallback: loggingCallback,
  preHandlerCallback: loggingCallback,
  onSendCallback: loggingCallback,
  onResponseCallback: loggingCallback,
  onRouteCallback: loggingCallback,
  onCloseCallback: loggingCallback,
  onReadyCallback: loggingCallback
})

function loggingCallback (ce) {
  console.log(`loggingCallback - CloudEvent dump ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
}

// TODO: add a fileCallback, to serialize CloudEvents to file ... wip

// example to handle a sample home request to serve a static page, optional here
fastify.get('/', function (req, reply) {
  const path = require('path')
  const scriptRelativeFolder = path.join(__dirname, path.sep)
  const fs = require('fs')
  const stream = fs.createReadStream(path.join(scriptRelativeFolder, 'home.html'))
  reply.type('text/html').send(stream)
})

fastify.listen(3000, '0.0.0.0', (err) => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})

fastify.ready(() => {
  const routes = fastify.printRoutes()
  console.log(`Available Routes:\n${routes}`)
})

// TODO: check if implement 'fastify.close()' to see related hook in the plugin ... wip

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

const k = {
  protocol: 'http',
  address: '0.0.0.0',
  port: 3000,
  baseNamespace: 'com.github.smartiniOnGitHub.fastify-cloudevents.example',
  cloudEventOptions: {
    strict: true // enable strict mode in generated CloudEvents, optional
  }
}
k.serverUrl = `${k.protocol}://${k.address}:${k.port}/`
k.cloudEventOptions.source = k.serverUrl

// define a sample id generator here
const hostname = require('os').hostname()
const pid = require('process').pid
function * idCounterExample () {
  let counter = 0
  while (true) {
    yield `${counter++}`
  }
}

// define a generator, to use everywhere here
const gen = idCounterExample()

// register plugin with all its options (as a sample)
fastify.register(require('../src/plugin'), {
  serverUrl: k.serverUrl,
  idGenerator: gen,
  onRequestCallback: loggingCallback,
  preHandlerCallback: loggingCallback,
  onSendCallback: loggingCallback,
  onResponseCallback: loggingCallback,
  onRouteCallback: loggingCallback,
  onCloseCallback: loggingCallback,
  onReadyCallback: loggingCallback,
  cloudEventOptions: k.cloudEventOptions
})

function loggingCallback (ce) {
  console.log(`loggingCallback - CloudEvent dump ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
}

// example to handle a sample home request to serve a static page, optional here
fastify.get('/', function (req, reply) {
  const path = require('path')
  const scriptRelativeFolder = path.join(__dirname, path.sep)
  const fs = require('fs')
  const stream = fs.createReadStream(path.join(scriptRelativeFolder, 'home.html'))
  reply.type('text/html; charset=utf-8').send(stream)
})
// example route, to return current timestamp but in async way
fastify.get('/time', async (req, reply) => {
  return { timestamp: Math.floor(Date.now()) }
})

fastify.listen(k.port, k.address, (err, address) => {
  if (err) {
    throw err
  }
  console.log(`Server listening on ${address}`)
  const ce = new fastify.CloudEvent(gen.next().value,
    `${k.baseNamespace}.listen`,
    {
      timestamp: Math.floor(Date.now()),
      status: 'listening',
      hostname: hostname,
      pid: pid
    }, // data
    k.cloudEventOptions
  )
  loggingCallback(ce)
})

fastify.ready((err) => {
  if (err) {
    throw err
  }
  const routes = fastify.printRoutes()
  console.log(`Available Routes:\n${routes}`)
  const ce = new fastify.CloudEvent(gen.next().value,
    `${k.baseNamespace}.ready`,
    {
      timestamp: Math.floor(Date.now()),
      status: 'ready',
      hostname: hostname,
      pid: pid
    }, // data
    k.cloudEventOptions
  )
  loggingCallback(ce)
})

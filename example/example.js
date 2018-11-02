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

const assert = require('assert')
const fastify = require('fastify')()
const fastifyVersion = require('fastify/package.json').version // get Fastify version
const CloudEventUtilityConstructor = require('../src/constructor') // direct reference to the library

const k = {
  protocol: 'http',
  address: '0.0.0.0',
  port: 3000,
  baseNamespace: 'com.github.smartiniOnGitHub.fastify-cloudevents.example',
  cloudEventOptions: {}
}
k.serverUrl = `${k.protocol}://${k.address}:${k.port}/`
k.cloudEventOptions.source = k.serverUrl
// assert(k !== null)

// define a sample id generator here
const hostname = require('os').hostname()
const idPrefix = `fastify-${fastifyVersion}@${hostname}`
function * idMakerExample () {
  while (true) {
    const timestamp = Math.floor(Date.now())
    yield `${idPrefix}@${timestamp}`
  }
}

// raise an event at server start, before loading the plugin, feasible but pay attention ...
raiseEventAtStartServerScript()

// register plugin with all its options (as a sample)
fastify.register(require('../src/plugin'), {
  serverUrl: k.serverUrl,
  idGenerator: idMakerExample,
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

function loggingCloseServerCallback () {
  console.log(`console - server-script.stop - server instance closed at ${new Date()}`)
}
assert(loggingCloseServerCallback !== null)

function raiseEventAtStartServerScript () {
  // example to get exposed functions of the plugin, before/without registering it ...
  const ce = new CloudEventUtilityConstructor(idMakerExample().next().value,
    `${k.baseNamespace}.server-script.start`,
    {
      timestamp: Math.floor(Date.now()),
      description: 'Fastify server startup begin',
      version: fastifyVersion
    }, // data
    k.cloudEventOptions
  )
  console.log(`console - server-script.start: created CloudEvent ${CloudEventUtilityConstructor.dumpObject(ce, 'ce')}`)
  // note that in this case still I can't use some features exposed by the plugin, and some fields take a default value in the plugin so here could be missing (like eventTypeVersion)
}

// example to handle a sample home request to serve a static page, optional here
fastify.get('/', function (req, reply) {
  const path = require('path')
  const scriptRelativeFolder = path.join(__dirname, path.sep)
  const fs = require('fs')
  const stream = fs.createReadStream(path.join(scriptRelativeFolder, 'home.html'))
  reply.type('text/html').send(stream)
})
// example route, to return current timestamp but in async way
fastify.get('/time', async (req, reply) => {
  return { timestamp: Math.floor(Date.now()) }
})

fastify.listen(k.port, k.address, (err) => {
  if (err) {
    // TODO: forward this server event as a CloudEvent created here ... if possible add even process id (pid) ... wip
    // TODO: add error-specific info, and test it later ... wip
    const ce = new fastify.CloudEvent(idMakerExample().next().value,
      `${k.baseNamespace}.error`,
      {
        timestamp: Math.floor(Date.now())
      }, // data
      k.cloudEventOptions
    )
    // console.log(`DEBUG - listen: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
    loggingCallback(ce) // forward generated event to a callback before exiting ...
    throw err
  }
  console.log(`Server listening on ${fastify.server.address().port}`)
  // TODO: forward this server event as a CloudEvent created here ... in data, add a description field with details on address and port for the listening ... wip
  //  `${k.baseNamespace}.listen`,
})

fastify.ready((err) => {
  if (err) {
    // TODO: forward this server event as a CloudEvent created here ... if possible add even process id (pid) ... wip
    // TODO: add error-specific info, and test it later ... wip
    const ce = new fastify.CloudEvent(idMakerExample().next().value,
      `${k.baseNamespace}.error`,
      {
        timestamp: Math.floor(Date.now())
      }, // data
      k.cloudEventOptions
    )
    // console.log(`DEBUG - ready: created CloudEvent ${fastify.CloudEvent.dumpObject(ce, 'ce')}`)
    loggingCallback(ce) // forward generated event to a callback before exiting ...
    throw err
  }
  const routes = fastify.printRoutes()
  console.log(`Available Routes:\n${routes}`)
  // TODO: forward this server event as a CloudEvent created here ... wip
  //  `${k.baseNamespace}.ready`,
})

// trigger the stop of the server, example
// fastify.close(loggingCloseServerCallback())

// TODO: last, enable the strict mode in events and ensure all run as before, then disable it ... wip

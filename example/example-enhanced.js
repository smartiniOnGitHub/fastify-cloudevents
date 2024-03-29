/*
 * Copyright 2018-2023 the original author or authors.
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

const assert = require('node:assert').strict
const fastify = require('fastify')()
const fastifyVersion = require('fastify/package.json').version // get Fastify version
const CloudEventUtilityConstructor = require('../src/constructor') // direct reference to another script in the library

const pluginName = require('../package.json').name // get plugin name
const pluginVersion = require('../package.json').version // get plugin version

const k = {
  protocol: 'http',
  address: '0.0.0.0',
  port: 3000,
  serverUrlMode: 'pluginAndRequestSimplified', // same behavior as default value, but in this way set in CloudEvent extension object
  baseNamespace: `com.github.smartiniOnGitHub.${pluginName}-v${pluginVersion}.example-enhanced`,
  includeHeaders: true, // change from default value, as a sample
  includeHttpAttributes: true, // change from default value, as a sample
  includeRedundantAttributes: true, // change from default value, as a sample
  cloudEventOptions: {
    strict: true // enable strict mode in generated CloudEvents, optional
  },
  // to be able to store serverUrlMode in CloudEvents extensions, set it
  cloudEventExtensions: null // sample null extension, good even in strict mode
  // cloudEventExtensions: {} // ok, but no empty extensions in strict mode
  // cloudEventExtensions: { exampleExtension: 'value' } // sample extension
}
k.serverUrl = `${k.protocol}://${k.address}:${k.port}`
k.source = k.serverUrl
// assert(k !== null)

// define a sample id generator here
const hostname = require('node:os').hostname()
const pid = require('node:process').pid
function * idMakerExample () {
  const idPrefix = `fastify-${fastifyVersion}@${hostname}@${pid}`
  while (true) {
    const timestamp = Date.now()
    yield `${idPrefix}@${timestamp}`
  }
}

// define a generator, to use everywhere here
const gen = idMakerExample()

// raise an event at server start, before loading the plugin, feasible but pay attention ...
raiseEventAtStartServerScript()

// register plugin with all its options (as a sample)
fastify.register(require('../src/plugin'), {
  serverUrl: k.serverUrl,
  serverUrlMode: k.serverUrlMode,
  baseNamespace: k.baseNamespace,
  idGenerator: gen,
  includeHeaders: k.includeHeaders,
  includeHttpAttributes: k.includeHttpAttributes,
  includeRedundantAttributes: k.includeRedundantAttributes,
  onRequestCallback: loggingCallback,
  preParsingCallback: loggingCallback,
  preValidationCallback: loggingCallback,
  preHandlerCallback: loggingCallback,
  preSerializationCallback: loggingCallback,
  onErrorCallback: loggingCallback,
  onSendCallback: loggingCallback,
  onResponseCallback: loggingCallback,
  onTimeoutCallback: loggingCallback,
  onCloseCallback: loggingCallback,
  onRouteCallback: loggingCallback,
  onRegisterCallback: loggingCallback,
  onReadyCallback: loggingCallback,
  cloudEventOptions: k.cloudEventOptions,
  cloudEventExtensions: k.cloudEventExtensions
})

function loggingCallback (ce) {
  console.log(`loggingCallback - CloudEvent dump ${fastify.CloudEventTransformer.dumpObject(ce, 'ce')}`)
}

function loggingCloseServerCallback () {
  console.log(`console - server-script.stop - server instance closed at ${new Date()}`)
}
assert(loggingCloseServerCallback !== null)

function raiseEventAtStartServerScript () {
  // example to get exposed functions of the plugin, before/without registering it ...
  if (CloudEventUtilityConstructor) {
    // with local, relative path could not be available
    const ce = new CloudEventUtilityConstructor.CloudEvent(gen.next().value,
      `${k.baseNamespace}.server-script.start`,
      k.source,
      {
        timestamp: Date.now(),
        description: 'Fastify server startup begin',
        version: fastifyVersion,
        status: 'starting',
        hostname,
        pid
      }, // data
      k.cloudEventOptions,
      k.cloudEventExtensions
    )
    console.log(`console - server-script.start: created CloudEvent ${CloudEventUtilityConstructor.CloudEventTransformer.dumpObject(ce, 'ce')}`)
  // note that in this case still I can't use some features exposed by the plugin, and some fields take a default value in the plugin so here could be missing
  }
}

// example to handle a sample home request to serve a static page, optional here
fastify.get('/', function (req, reply) {
  const path = require('node:path')
  const scriptRelativeFolder = path.join(__dirname, path.sep)
  const fs = require('node:fs')
  const stream = fs.createReadStream(path.join(scriptRelativeFolder, 'home.html'))
  reply.type('text/html; charset=utf-8').send(stream)
})
// example route, to return current timestamp but in async way
fastify.get('/time', async (req, reply) => {
  const now = new Date()
  const timestamp = now.getTime()
  return {
    timestamp,
    time: now.toISOString()
  }
})
// example route, to always generate an error
fastify.get('/error', async (req, reply) => {
  const err = new Error()
  err.message = 'Error Message'
  err.statusCode = reply.code
  err.description = 'Verbose Error description...'
  err.code = 500
  reply.code(err.code) // set the same error code in the reply

  return err
})

fastify.listen({ port: k.port, host: k.address }, (err, address) => {
  const processInfoAsData = fastify.CloudEventTransformer.processInfoToData()
  if (err) {
    const errorAsData = fastify.CloudEventTransformer.errorToData(err, {
      includeStackTrace: true,
      addStatus: true,
      addTimestamp: true
    })
    const ce = new fastify.CloudEvent(gen.next().value,
      `${k.baseNamespace}.listen.error`,
      k.source,
      {
        ...errorAsData,
        ...processInfoAsData,
        port: address
      }, // data
      k.cloudEventOptions,
      k.cloudEventExtensions
    )
    loggingCallback(ce) // forward generated event to a callback before exiting ...
    throw err
  }
  console.log(`Server listening on ${address}`)
  const ce = new fastify.CloudEvent(gen.next().value,
    `${k.baseNamespace}.listen`,
    k.source,
    {
      timestamp: Date.now(),
      status: 'listening',
      ...processInfoAsData,
      port: address
    }, // data
    k.cloudEventOptions,
    k.cloudEventExtensions
  )
  loggingCallback(ce)
})

fastify.ready((err) => {
  const processInfoAsData = fastify.CloudEventTransformer.processInfoToData()
  if (err) {
    const errorAsData = fastify.CloudEventTransformer.errorToData(err, {
      includeStackTrace: true,
      addStatus: true,
      addTimestamp: true
    })
    const ce = new fastify.CloudEvent(gen.next().value,
      `${k.baseNamespace}.ready.error`,
      k.source,
      {
        ...errorAsData,
        ...processInfoAsData
      }, // data
      k.cloudEventOptions,
      k.cloudEventExtensions
    )
    loggingCallback(ce) // forward generated event to a callback before exiting ...
    throw err
  }
  const routes = fastify.printRoutes()
  console.log(`Available Routes:\n${routes}`)
  const ce = new fastify.CloudEvent(gen.next().value,
    `${k.baseNamespace}.ready`,
    k.source,
    {
      timestamp: Date.now(),
      status: 'ready',
      ...processInfoAsData
    }, // data
    k.cloudEventOptions,
    k.cloudEventExtensions
  )
  loggingCallback(ce)
})

// trigger the stop of the server, example
// fastify.close(loggingCloseServerCallback())

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
const test = require('tap').test
// const sget = require('simple-get').concat
const Fastify = require('fastify')
const fastifyCloudevents = require('../src/plugin')

/** @test {fastifyCloudEvents} */
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  t.plan(8)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(fastifyCloudevents) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    t.error(err)

    {
      // ensure CloudEvent class exist in Fastify decorators ...
      t.ok(fastify.hasDecorator('CloudEvent'))
      const CloudEvent = fastify.CloudEvent
      // optional, add some assertions with standard Node.js assert statements, as a sample
      assert(CloudEvent !== null)
      assert(typeof CloudEvent === 'function')
      t.ok(CloudEvent)
      t.strictEqual(typeof CloudEvent, 'function')
    }

    {
      // ensure CloudEventTransformer class exist in Fastify decorators ...
      t.ok(fastify.hasDecorator('CloudEventTransformer'))
      const CloudEventTransformer = fastify.CloudEventTransformer
      assert(CloudEventTransformer !== null)
      assert(typeof CloudEventTransformer === 'function')
      t.ok(CloudEventTransformer)
      t.strictEqual(typeof CloudEventTransformer, 'function')
    }

    {
      const ceSerializeFast = fastify.cloudEventSerializeFast
      t.ok(ceSerializeFast)
    }
  })
})

function loggingCallback (ce) {
  console.log(`loggingCallback - CloudEvent dump ${Fastify().CloudEvent.dumpObject(ce, 'ce')}`)
}
assert(loggingCallback !== null)

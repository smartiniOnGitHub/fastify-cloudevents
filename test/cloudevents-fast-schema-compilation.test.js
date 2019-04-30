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

// use 'ajv' (dependency of fast-json-stringify') in all tests here

// TODO: check if remove this test function here (redundant) ... wip
/** @test {fastifyCloudEvents} */
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  t.plan(9)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    t.error(err)

    // ensure CloudEvent class exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('CloudEvent'))
    const CloudEvent = fastify.CloudEvent
    // optional, add some assertions with standard Node.js assert statements, as a sample
    assert(CloudEvent !== null)
    assert(typeof CloudEvent === 'function')
    assert(new CloudEvent() instanceof CloudEvent)
    assert.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')
    t.ok(CloudEvent)
    t.strictEqual(typeof CloudEvent, 'function')
    t.strictEqual(new CloudEvent() instanceof CloudEvent, true)
    t.strictEqual(CloudEvent.mediaType(), 'application/cloudevents+json')

    // ensure cloudEventSerializeFast function exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('cloudEventSerializeFast'))
    const ceSerializeFast = fastify.cloudEventSerializeFast
    assert(ceSerializeFast !== null)
    assert(typeof ceSerializeFast === 'function')
    t.ok(ceSerializeFast)
    t.strictEqual(typeof ceSerializeFast, 'function')
  })
})

// import some common test data
const {
  // commonEventTime,
  // ceCommonOptions,
  ceCommonOptionsStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData
  // ceMapData
} = require('./common-test-data')

const Ajv = require('ajv')

/** @test {fastifyCloudEvents} */
test('ensure CloudEvent schema (exposed by the plugin) pass validation with a schema compiler', (t) => {
  t.plan(11)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    t.error(err)

    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    const ceSchema = CloudEvent.getJSONSchema()
    t.ok(ceSchema)
    t.strictEqual(typeof ceSchema, 'object')

    const ajv = new Ajv({ coerceTypes: true, removeAdditional: true })
    t.ok(ajv)
    const ceValidate = ajv.compile(ceSchema)
    t.ok(ceValidate)
    const ceValidateAlwaysFail = function (schema) {
      return { error: new Error('Always fail') }
      // TODO: check if it's good ... wip
    }
    t.ok(ceValidateAlwaysFail)

    {
      // test on some good data
      const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        ceCommonOptionsStrict
      )
      t.ok(ceFullStrict)
      const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict, { onlyValid: true })
      t.ok(ceFullStrictSerializedFast)
      const ceFullStrictValid = ceValidate(ceFullStrict)
      if (!ceFullStrictValid) console.log(ceValidate.errors)
      t.ok(ceFullStrictValid)
    }

    // TODO: add other tests for the other schema validator ... wip
  })
})

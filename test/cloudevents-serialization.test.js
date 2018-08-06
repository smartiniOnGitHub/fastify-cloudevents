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

/** @test {CloudEvent} */
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  t.plan(7)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)

    // ensure CloudEventCreate constructor function exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('CloudEventCreate'))
    const CECreator = fastify.CloudEventCreate
    // optional, add some assertions with standard Node.js assert statements, as a sample
    assert(CECreator !== null)
    assert(typeof CECreator === 'function')
    t.ok(CECreator)
    t.strictEqual(typeof CECreator, 'function')

    // ensure cloudEventSerialization function exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('cloudEventSerialization'))
    const ceSerialize = fastify.cloudEventSerialization
    assert(ceSerialize !== null)
    assert(typeof ceSerialize === 'function')
    t.ok(ceSerialize)
    t.strictEqual(typeof ceSerialize, 'function')
  })
})

/** create some common options, for better reuse in tests */
const ceCommonOptions = {
  cloudEventsVersion: '0.1.0',
  eventTypeVersion: '1.0.0',
  source: '/test',
  eventTime: new Date(),
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: false
}
/*
// TODO: uncomment them or remove ... wip
/ ** create some common options with strict flag enabled, for better reuse in tests * /
const ceCommonOptionsStrict = {
  cloudEventsVersion: '0.1.0',
  eventTypeVersion: '1.0.0',
  source: '/test',
  eventTime: new Date(),
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: true
}
 */
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { 'hello': 'world', 'year': 2018 }

// TODO: add a test without mandatory fields ... wip

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  t.plan(11)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const CECreator = fastify.CloudEventCreate
    t.ok(CECreator)
    const ceIsValid = fastify.isCloudEventValid
    t.ok(ceIsValid)
    const ceValidate = fastify.cloudEventValidation
    t.ok(ceValidate)
    const ceSerialize = fastify.cloudEventSerialization
    t.ok(ceSerialize)

    // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullData = new CECreator('1/full/sample-data/no-strict',
      'org.fastify.plugins.cloudevents.testevent',
      ceCommonData, // data
      ceCommonOptions
    )
    assert(ceFullData !== null)
    t.ok(ceFullData)
    t.ok(ceIsValid(ceFullData))
    t.ok(ceIsValid(ceFullData, { strict: false }))
    t.strictSame(ceValidate(ceFullData), [])
    t.strictSame(ceValidate(ceFullData, { strict: false }).length, 0)
    const ceFullDataSerialized = ceSerialize(ceFullData)
    t.ok(ceFullDataSerialized)
    // TODO: check why serialized data doesn't have its attributes ... wip
    // TODO: add more test on the generated string ... better, check on a re-built object by de-serializing the string ... wip
    // the same with with strict mode enabled ...
    // const ceFullDataStrict = new CECreator('1/full/sample-data/strict',
    // TODO: add more test ... wip
  })
})

// TODO: add more test, like: with data, with additional fields to skip, etc ... wip

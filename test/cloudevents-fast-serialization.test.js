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

// use 'fast-json-stringify' in all tests here

/** @test {CloudEvent} */
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  t.plan(9)
  const fastify = Fastify()
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    fastify.server.unref()
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

/** create some common options, for better reuse in tests */
const commonEventTime = new Date()
const ceCommonOptions = {
  cloudEventsVersion: '0.1.0',
  eventTypeVersion: '1.0.0',
  source: '/test',
  eventTime: commonEventTime,
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: false
}
/** create some common options with strict flag enabled, for better reuse in tests */
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { 'hello': 'world', 'year': 2018 }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map(['key-1', 'value 1'], ['key-2', 'value 2'])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  t.plan(31)
  const fastify = Fastify()
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    fastify.server.unref()
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceIsValid = CloudEvent.isValidEvent
    t.ok(ceIsValid)
    const ceValidate = CloudEvent.validateEvent
    t.ok(ceValidate)
    // const ceSerialize = CloudEvent.serializeEvent
    // t.ok(ceSerialize)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFull = new CloudEvent('1/full/sample-data/no-strict',
      'com.github.smartiniOnGitHub.fastify-cloudevents.testevent',
      ceCommonData, // data
      ceCommonOptions
    )
    assert(ceFull !== null)
    t.ok(ceFull)
    t.ok(ceFull.isValid())
    t.ok(ceFull.validate().length === 0)
    t.ok(ceFull.validate({ strict: false }).length === 0)
    t.ok(ceFull.validate({ strict: true }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFull))
    t.ok(CloudEvent.validateEvent(ceFull).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, { strict: false }).length === 0)
    t.ok(CloudEvent.validateEvent(ceFull, { strict: true }).length === 0)

    // const ceSerializeFast = fastify.cloudEventSerializeFast
    assert(ceSerializeFast !== null)
    t.ok(ceSerializeFast)
    const ceFullSerializedFast = ceSerializeFast(ceFull)
    t.ok(ceFullSerializedFast)

    const ceFullSerializedFastComparison = `{"data":{"hello":"world","year":2018},"extensions":{"exampleExtension":"value"},"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/no-strict","eventType":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent","eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullSerializedFast, ceFullSerializedFastComparison)
    const ceFullDeserializedFast = JSON.parse(ceFullSerializedFast) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullDeserializedFast.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
    t.same(ceFull, ceFullDeserializedFast)

    // the same with with strict mode enabled ...
    const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
      'com.github.smartiniOnGitHub.fastify-cloudevents.testevent',
      ceCommonData, // data
      ceCommonOptionsStrict
    )
    assert(ceFullStrict !== null)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isValid())
    t.ok(ceFullStrict.validate().length === 0)
    t.ok(ceFullStrict.validate({ strict: true }).length === 0)
    t.ok(ceFullStrict.validate({ strict: false }).length === 0)
    t.ok(CloudEvent.isValidEvent(ceFullStrict))
    t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, { strict: true }).length === 0)
    t.ok(CloudEvent.validateEvent(ceFullStrict, { strict: false }).length === 0)

    // const ceSerializeFast = fastify.cloudEventSerializeFast
    assert(ceSerializeFast !== null)
    t.ok(ceSerializeFast)
    const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict)
    t.ok(ceFullStrictSerializedFast)

    const ceFullStrictSerializedFastComparison = `{"data":{"hello":"world","year":2018},"extensions":{"exampleExtension":"value","strict":true},"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/strict","eventType":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent","eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullStrictSerializedFast, ceFullStrictSerializedFastComparison)
    const ceFullStrictDeserializedFast = JSON.parse(ceFullStrictSerializedFast) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullStrictDeserializedFast.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
    t.same(ceFullStrict, ceFullStrictDeserializedFast)
  })
})

// TODO: this is a limit if the current implementation, and will be resolved soon ... wip
/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contentType, expect error', (t) => {
  t.plan(6)

  const fastify = Fastify()
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    fastify.server.unref()
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)

    // create an instance with non default contentType (other options default): expected success ...
    // but when I try to serialize it, expect to have an error raised ...
    const ceFullOtherContentType = new CloudEvent('1/non-default-contentType/sample-data/no-strict',
      'com.github.smartiniOnGitHub.fastify-cloudevents.testevent',
      ceCommonData, // data
      {
        contentType: 'application/xml'
      }
    )
    assert(ceFullOtherContentType !== null)
    t.ok(ceFullOtherContentType)
    t.ok(ceFullOtherContentType.isValid())

    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)
    // const ceFullOtherContentTypeSerializedFast = ceSerializeFast(ceFullOtherContentType)
    // t.ok(ceFullOtherContentTypeSerializedFast)
    t.throws(function () {
      const ceFullOtherContentTypeSerializedFast = ceSerializeFast(ceFullOtherContentType)
      assert(ceFullOtherContentTypeSerializedFast === null) // never executed
    }, Error, 'Expected exception when serializing the current CloudEvent instance')
  })
})

// TODO: add more test, like: with data (even nested properties), with additional fields to skip, etc ... wip

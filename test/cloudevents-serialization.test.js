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

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  t.plan(33)
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
    const ceFullDataSerializedComparison = `{"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/no-strict","eventType":"org.fastify.plugins.cloudevents.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value"},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullDataSerialized, ceFullDataSerializedComparison)
    const ceFullDataDeserialized = JSON.parse(ceFullDataSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullDataDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
    t.same(ceFullData, ceFullDataDeserialized)
    const ceFullDataEnhanced = { ...ceFullData, ...{ otherAttribute: 'sample value' } }
    const ceFullDataSerializedCustom1 = ceSerialize(ceFullDataEnhanced, { schema: { additionalProperties: false } }) // override the schema, additional properties disabled (default)
    t.ok(ceFullDataSerializedCustom1)
    const ceFullDataSerializedCustomComparison1 = `{"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/no-strict","eventType":"org.fastify.plugins.cloudevents.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value"},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullDataSerializedCustom1, ceFullDataSerializedCustomComparison1)
    const ceFullDataSerializedCustom2 = ceSerialize(ceFullDataEnhanced, { schema: { additionalProperties: true } }) // override the schema, additional properties enabled
    t.ok(ceFullDataSerializedCustom2)
    const ceFullDataSerializedCustomComparison2 = `{"otherAttribute":"sample value","cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/no-strict","eventType":"org.fastify.plugins.cloudevents.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value"},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullDataSerializedCustom2, ceFullDataSerializedCustomComparison2)
    const ceFullDataSerializedCustom3 = ceSerialize(ceFullDataEnhanced, { schema: { properties: { data: { type: 'object', additionalProperties: false, properties: { hello: { type: 'string' }, year: { type: 'number' } } } }, additionalProperties: true } }) // override the schema, with a fixed set of nested attributes for data
    t.ok(ceFullDataSerializedCustom3)
    const ceFullDataSerializedCustomComparison3 = `{"eventID":"1/full/sample-data/no-strict","eventType":"org.fastify.plugins.cloudevents.testevent","cloudEventsVersion":"0.1.0","contentType":"application/json","eventTime":"${commonEventTime.toISOString()}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value"},"schemaURL":"http://my-schema.localhost.localdomain","source":"/test","otherAttribute":"sample value","data":{"hello":"world","year":2018}}`
    t.strictSame(ceFullDataSerializedCustom3, ceFullDataSerializedCustomComparison3)
    // the same with with strict mode enabled ...
    const ceFullDataStrict = new CECreator('1/full/sample-data/strict',
      'org.fastify.plugins.cloudevents.testevent',
      ceCommonData, // data
      ceCommonOptionsStrict
    )
    assert(ceFullDataStrict !== null)
    t.ok(ceFullDataStrict)
    t.ok(ceIsValid(ceFullDataStrict))
    t.ok(ceIsValid(ceFullDataStrict, { strict: true }))
    t.strictSame(ceValidate(ceFullDataStrict), [])
    t.strictSame(ceValidate(ceFullDataStrict, { strict: true }).length, 0)
    const ceFullDataStrictSerialized = ceSerialize(ceFullDataStrict)
    t.ok(ceFullDataStrictSerialized)
    const ceFullDataStrictSerializedComparison = `{"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/strict","eventType":"org.fastify.plugins.cloudevents.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value","strict":true},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullDataStrictSerialized, ceFullDataStrictSerializedComparison)
    const ceFullDataStrictDeserialized = JSON.parse(ceFullDataStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullDataStrictDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
    t.same(ceFullDataStrict, ceFullDataStrictDeserialized)
    const ceFullDataStrictEnhanced = { ...ceFullDataStrict, ...{ otherAttribute: 'sample value' } }
    const ceFullDataStrictSerializedCustom1 = ceSerialize(ceFullDataStrictEnhanced, { schema: { additionalProperties: false } }) // override the schema, additional properties disabled (default)
    t.ok(ceFullDataStrictSerializedCustom1)
    const ceFullDataStrictSerializedCustomComparison1 = `{"cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/strict","eventType":"org.fastify.plugins.cloudevents.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value","strict":true},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullDataStrictSerializedCustom1, ceFullDataStrictSerializedCustomComparison1)
    const ceFullDataStrictSerializedCustom2 = ceSerialize(ceFullDataStrictEnhanced, { schema: { additionalProperties: true } }) // override the schema, additional properties enabled
    t.ok(ceFullDataStrictSerializedCustom2)
    const ceFullDataStrictSerializedCustomComparison2 = `{"otherAttribute":"sample value","cloudEventsVersion":"0.1.0","eventID":"1/full/sample-data/strict","eventType":"org.fastify.plugins.cloudevents.testevent","data":{"hello":"world","year":2018},"eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","extensions":{"exampleExtension":"value","strict":true},"contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullDataStrictSerializedCustom2, ceFullDataStrictSerializedCustomComparison2)
    const ceFullDataStrictSerializedCustom3 = ceSerialize(ceFullDataStrictEnhanced, { schema: { properties: { data: { type: 'object', additionalProperties: false, properties: { hello: { type: 'string' }, year: { type: 'number' } } } }, additionalProperties: true } }) // override the schema, with a fixed set of nested attributes for data
    t.ok(ceFullDataStrictSerializedCustom3)
    const ceFullDataStrictSerializedCustomComparison3 = `{"eventID":"1/full/sample-data/strict","eventType":"org.fastify.plugins.cloudevents.testevent","cloudEventsVersion":"0.1.0","contentType":"application/json","eventTime":"${commonEventTime.toISOString()}","eventTypeVersion":"1.0.0","extensions":{"exampleExtension":"value","strict":true},"schemaURL":"http://my-schema.localhost.localdomain","source":"/test","otherAttribute":"sample value","data":{"hello":"world","year":2018}}`
    t.strictSame(ceFullDataStrictSerializedCustom3, ceFullDataStrictSerializedCustomComparison3)
  })
})

// TODO: add a test without mandatory fields ... wip

// TODO: add test with a non default contentType ... wip

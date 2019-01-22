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

/** @test {fastifyCloudEvents} */
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
  eventTypeVersion: '1.0.0',
  eventTime: commonEventTime,
  extensions: { 'exampleExtension': 'value' },
  contentType: 'application/json',
  schemaURL: 'http://my-schema.localhost.localdomain',
  strict: false
}
/** create some common options with strict flag enabled, for better reuse in tests */
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
/** create a sample namespace for events here, for better reuse in tests */
const ceNamespace = 'com.github.smartiniOnGitHub.fastify-cloudevents.testevent'
/** create a sample common server URL, for better reuse in tests */
const ceServerUrl = '/test'
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { 'hello': 'world', 'year': 2018 }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map(['key-1', 'value 1'], ['key-2', 'value 2'])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

/** @test {fastifyCloudEvents} */
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
      ceNamespace,
      ceServerUrl,
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

    const ceFullSerializedFastComparison = `{"data":{"hello":"world","year":2018},"extensions":{"exampleExtension":"value"},"cloudEventsVersion":"0.1","eventID":"1/full/sample-data/no-strict","eventType":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent","eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullSerializedFast, ceFullSerializedFastComparison)
    const ceFullDeserializedFast = JSON.parse(ceFullSerializedFast) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullDeserializedFast.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
    t.same(ceFull, ceFullDeserializedFast)

    // the same with with strict mode enabled ...
    const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
      ceNamespace,
      ceServerUrl,
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

    const ceFullStrictSerializedFastComparison = `{"data":{"hello":"world","year":2018},"extensions":{"exampleExtension":"value","strict":true},"cloudEventsVersion":"0.1","eventID":"1/full/sample-data/strict","eventType":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent","eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
    t.strictSame(ceFullStrictSerializedFast, ceFullStrictSerializedFastComparison)
    const ceFullStrictDeserializedFast = JSON.parse(ceFullStrictSerializedFast) // note that some fields (like dates) will be different when deserialized in this way ...
    ceFullStrictDeserializedFast.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
    t.same(ceFullStrict, ceFullStrictDeserializedFast)
  })
})

/** @test {fastifyCloudEvents} */
test('serialize a CloudEvent instance with a non default contentType and empty serialization options, expect error', (t) => {
  t.plan(10)

  const fastify = Fastify()
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    fastify.server.unref()
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    {
      // create an instance with non default contentType (other options default): expected success ...
      // but when I try to serialize it without specifying serialization options, expect to have an error raised ...
      const ceFullOtherContentType = new CloudEvent('1/non-default-contentType/sample-data/no-strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptions,
          contentType: 'application/xml'
        }
      )
      assert(ceFullOtherContentType !== null)
      t.ok(ceFullOtherContentType)
      t.ok(ceFullOtherContentType.isValid())
      t.throws(function () {
        const ceFullOtherContentTypeSerializedFast = ceSerializeFast(ceFullOtherContentType)
        assert(ceFullOtherContentTypeSerializedFast === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')
    }

    {
      // the same with with strict mode enabled ...
      const ceFullOtherContentTypeStrict = new CloudEvent('1/non-default-contentType/sample-data/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptionsStrict,
          contentType: 'application/xml'
        }
      )
      assert(ceFullOtherContentTypeStrict !== null)
      t.ok(ceFullOtherContentTypeStrict)
      t.ok(ceFullOtherContentTypeStrict.isValid())
      t.throws(function () {
        const ceFullOtherContentTypeStrictSerialized = ceSerializeFast(ceFullOtherContentTypeStrict)
        assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')
      t.throws(function () {
        const ceFullOtherContentTypeStrictSerialized = ceSerializeFast(ceFullOtherContentTypeStrict, {
          encoder: null,
          encodedData: null
        })
        assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')
    }
  })
})

// sample encoding function, to use in tests here
function encoderSample () {
  // return `<data "hello"="world" "year"="2018" />`
  return `<data encoder="sample" />`
}

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contentType and right serialization options, expect success', (t) => {
  t.plan(13)

  const fastify = Fastify()
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    fastify.server.unref()
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    {
      // create an instance with non default contentType (other options default): expected success ...
      // when I try to serialize specifying right serialization options, expect success ...
      const ceFullOtherContentType = new CloudEvent('1/non-default-contentType/sample-data/no-strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptions,
          contentType: 'application/xml'
        }
      )
      assert(ceFullOtherContentType !== null)
      t.ok(ceFullOtherContentType)
      t.ok(ceFullOtherContentType.isValid())
      // test different combinations of serialization options
      // note that if given, encoder function has priority over encoded data
      const cceFullOtherContentTypeSerialized1 = ceSerializeFast(ceFullOtherContentType, {
        encoder: encoderSample
      })
      t.ok(cceFullOtherContentTypeSerialized1)
      const cceFullOtherContentTypeSerialized2 = ceSerializeFast(ceFullOtherContentType, {
        encodedData: `<data "hello"="world" "year"="2018" />`
      })
      t.ok(cceFullOtherContentTypeSerialized2)
      const constEncodedData = `<data "constant"="encoded" />`
      const cceFullOtherContentTypeSerialized3 = ceSerializeFast(ceFullOtherContentType, {
        encoder: encoderSample,
        // encodedData: undefined
        // encodedData: null
        // encodedData: `<data "hello"="world" "year"="2018" />`
        encodedData: constEncodedData
      })
      t.ok(cceFullOtherContentTypeSerialized3)
    }

    {
      // the same with with strict mode enabled ...
      const ceFullOtherContentTypeStrict = new CloudEvent('1/non-default-contentType/sample-data/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptionsStrict,
          contentType: 'application/xml'
        }
      )
      assert(ceFullOtherContentTypeStrict !== null)
      t.ok(ceFullOtherContentTypeStrict)
      t.ok(ceFullOtherContentTypeStrict.isValid())
      // test different combinations of serialization options
      // note that if given, encoder function has priority over encoded data
      const ceFullOtherContentTypeStrictSerialized1 = ceSerializeFast(ceFullOtherContentTypeStrict, {
        encoder: encoderSample
      })
      t.ok(ceFullOtherContentTypeStrictSerialized1)
      const ceFullOtherContentTypeStrictSerialized2 = ceSerializeFast(ceFullOtherContentTypeStrict, {
        encodedData: `<data "hello"="world" "year"="2018" />`
      })
      t.ok(ceFullOtherContentTypeStrictSerialized2)
      const constEncodedData = `<data "constant"="encoded" />`
      const ceFullOtherContentTypeStrictSerialized3 = ceSerializeFast(ceFullOtherContentTypeStrict, {
        encoder: encoderSample,
        // encodedData: undefined
        // encodedData: null
        // encodedData: `<data "hello"="world" "year"="2018" />`
        encodedData: constEncodedData
      })
      t.ok(ceFullOtherContentTypeStrictSerialized3)
    }
  })
})

/** @test {fastifyCloudEvents} */
test('ensure the JSON Schema for a CloudEvent (static and for a normal instance) is available', (t) => {
  t.plan(10)

  const fastify = Fastify()
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    fastify.server.unref()
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)

    // get JSON Schema from a static method
    const jsonSchemaStatic = CloudEvent.getJSONSchema()
    assert(jsonSchemaStatic !== null)
    t.ok(jsonSchemaStatic)
    t.strictEqual(typeof jsonSchemaStatic, 'object')

    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)
    const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      ceCommonOptionsStrict
    )
    assert(ceFullStrict !== null)
    t.ok(ceFullStrict)
    // get JSON Schema from that instance
    const jsonSchema = ceFullStrict.schema
    assert(jsonSchema !== null)
    t.ok(jsonSchema)
    t.strictEqual(typeof jsonSchema, 'object')

    const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict)
    t.ok(ceFullStrictSerializedFast)
    // ensure schema is always the same
    t.strictSame(jsonSchemaStatic, jsonSchema)
  })
})

/** create some common data with nested attributes, for better reuse in tests */
const ceCommonNestedData = {
  ...ceCommonData,
  nested1: {
    level1attribute: 'level1attributeValue',
    nested2: {
      level2attribute: 'level2attributeValue',
      nested3: {
        level3attribute: 'level3attributeValue'
      }
    }
  }
}

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON with nested data, and ensure they are right', (t) => {
  t.plan(39)

  const fastify = Fastify()
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    fastify.server.unref()
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    {
      const ceFull = new CloudEvent('1/full/sample-data-nested/no-strict',
        ceNamespace,
        ceServerUrl,
        ceCommonNestedData, // data
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

      const ceFullSerialized = ceSerializeFast(ceFull)
      t.ok(ceFullSerialized)

      const ceFullSerializedComparison = `{"data":{"hello":"world","year":2018,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"extensions":{"exampleExtension":"value"},"cloudEventsVersion":"0.1","eventID":"1/full/sample-data-nested/no-strict","eventType":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent","eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
      t.strictSame(ceFullSerialized, ceFullSerializedComparison)
      const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
      ceFullDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
      t.same(ceFull, ceFullDeserialized)

      // ensure payload data is a copy of event data
      let dataShallowClone = ceFull.payload
      // then ensure they are different object (references) ...
      assert(dataShallowClone !== null)
      assert(dataShallowClone !== ceFull.data) // they must be different object references
      assert(dataShallowClone !== ceFull.payload) // they must be different object references, at any invocation
      t.notEqual(dataShallowClone, ceFull.data)
      t.notStrictEqual(dataShallowClone, ceFull.data)
      t.notEqual(dataShallowClone, ceFull.payload)
      dataShallowClone = 'changed: true' // reassign to test that data won't be affected by that change
      t.notEqual(dataShallowClone, ceFull.data)
      t.strictNotSame(dataShallowClone, ceFull.data)
      t.notEqual(dataShallowClone, ceFull.payload)
    }

    {
      // the same with with strict mode enabled ...
      const ceFullStrict = new CloudEvent('1/full/sample-data-nested/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonNestedData, // data
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

      const ceFullStrictSerialized = ceSerializeFast(ceFullStrict)
      t.ok(ceFullStrictSerialized)

      const ceFullStrictSerializedComparison = `{"data":{"hello":"world","year":2018,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"extensions":{"exampleExtension":"value","strict":true},"cloudEventsVersion":"0.1","eventID":"1/full/sample-data-nested/strict","eventType":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent","eventTypeVersion":"1.0.0","source":"/test","eventTime":"${commonEventTime.toISOString()}","contentType":"application/json","schemaURL":"http://my-schema.localhost.localdomain"}`
      t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
      const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
      ceFullStrictDeserialized.eventTime = commonEventTime // quick fix for the Date/timestamo attribute in the deserialized object
      t.same(ceFullStrict, ceFullStrictDeserialized)

      // ensure payload data is a copy of event data
      let dataShallowCloneStrict = ceFullStrict.payload
      // then ensure they are different object (references) ...
      assert(dataShallowCloneStrict !== null)
      assert(dataShallowCloneStrict !== ceFullStrict.data) // they must be different object references
      assert(dataShallowCloneStrict !== ceFullStrict.payload) // they must be different object references, at any invocation
      t.notEqual(dataShallowCloneStrict, ceFullStrict.data)
      t.notStrictEqual(dataShallowCloneStrict, ceFullStrict.data)
      t.notEqual(dataShallowCloneStrict, ceFullStrict.payload)
      dataShallowCloneStrict = 'changed: true' // reassign to test that data won't be affected by that change
      t.notEqual(dataShallowCloneStrict, ceFullStrict.data)
      t.strictNotSame(dataShallowCloneStrict, ceFullStrict.data)
      t.notEqual(dataShallowCloneStrict, ceFullStrict.payload)
    }
  })
})

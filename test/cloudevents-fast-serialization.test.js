/*
 * Copyright 2018-2022 the original author or authors.
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
const test = require('tap').test
// const sget = require('simple-get').concat
const Fastify = require('fastify')

// get factory for instances to test
const ceFactory = require('./common-test-factory')

// import some common test data
// const td = require('./common-test-data')
const {
  // ceCommonData,
  ceDataXMLAsString,
  ceOptionsNoStrict,
  ceOptionsStrict,
  commonEventTime,
  valDebugInfoDisable,
  valDebugInfoEnable,
  valOnlyValidAllInstance,
  valOnlyValidInstance,
  valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
} = require('./common-test-data')

// use 'fast-json-stringify' in all tests here

/** @test {fastifyCloudEvents} */
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  // t.plan(9)
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
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
    t.equal(typeof CloudEvent, 'function')
    t.equal(new CloudEvent() instanceof CloudEvent, true)
    t.equal(CloudEvent.mediaType(), 'application/cloudevents+json')

    // ensure cloudEventSerializeFast function exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('cloudEventSerializeFast'))
    const ceSerializeFast = fastify.cloudEventSerializeFast
    assert(ceSerializeFast !== null)
    assert(typeof ceSerializeFast === 'function')
    t.ok(ceSerializeFast)
    t.equal(typeof ceSerializeFast, 'function')

    t.end()
  })
})

/** @test {fastifyCloudEvents} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
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

    {
      const ceFull = ceFactory.createFull(ceOptionsNoStrict)
      assert(ceFull !== null)
      t.ok(ceFull)
      t.ok(!ceFull.isStrict)
      t.ok(ceFull.isValid())
      t.ok(ceFull.validate().length === 0)
      t.ok(ceFull.validate({ ...valOptionsNoStrict }).length === 0)
      t.ok(ceFull.validate({ ...valOptionsStrict }).length === 0)
      t.ok(CloudEvent.isValidEvent(ceFull))
      t.ok(CloudEvent.validateEvent(ceFull).length === 0)
      t.ok(CloudEvent.validateEvent(ceFull, { ...valOptionsNoStrict }).length === 0)
      t.ok(CloudEvent.validateEvent(ceFull, { ...valOptionsStrict }).length === 0)

      // const ceSerializeFast = fastify.cloudEventSerializeFast
      assert(ceSerializeFast !== null)
      t.ok(ceSerializeFast)
      const ceFullSerializedFast = ceSerializeFast(ceFull)
      t.ok(ceFullSerializedFast)

      const ceFullSerializedFastComparison = `{"specversion":"1.0","id":"2/full","type":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent-v1.0.0","source":"/test","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${commonEventTime.toISOString()}","subject":"subject","data":{"hello":"world","year":2020,"enabled":true},"exampleextension":"value"}`
      t.strictSame(ceFullSerializedFast, ceFullSerializedFastComparison)
      // deserialization using standard function JSON.parse, so built instance is not a real CloudEvent instance
      const ceFullDeserializedFast = JSON.parse(ceFullSerializedFast) // note that some fields (like dates) will be different when deserialized in this way ...
      // ceFullDeserializedFast.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      ceFullDeserializedFast.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
      t.same(ceFull, ceFullDeserializedFast)
      t.ok(!CloudEvent.isCloudEvent(ceFullDeserializedFast))
      t.ok(!ceFullDeserializedFast.isStrict) // ok here, but doesn't mattter because is not a real CloudEvent instance
    }

    {
      // the same but with strict mode enabled ...
      const ceFullStrict = ceFactory.createFull(ceOptionsStrict)
      assert(ceFullStrict !== null)
      t.ok(ceFullStrict)
      t.ok(ceFullStrict.isStrict)
      t.ok(ceFullStrict.isValid())
      t.ok(ceFullStrict.validate().length === 0)
      t.ok(ceFullStrict.validate({ ...valOptionsStrict }).length === 0)
      t.ok(ceFullStrict.validate({ ...valOptionsNoStrict }).length === 0)
      t.ok(CloudEvent.isValidEvent(ceFullStrict))
      t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
      t.ok(CloudEvent.validateEvent(ceFullStrict, { ...valOptionsStrict }).length === 0)
      t.ok(CloudEvent.validateEvent(ceFullStrict, { ...valOptionsNoStrict }).length === 0)

      // const ceSerializeFast = fastify.cloudEventSerializeFast
      assert(ceSerializeFast !== null)
      t.ok(ceSerializeFast)
      const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict)
      t.ok(ceFullStrictSerializedFast)

      const ceFullStrictSerializedFastComparison = `{"specversion":"1.0","id":"2/full","type":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent-v1.0.0","source":"/test","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${commonEventTime.toISOString()}","subject":"subject","data":{"hello":"world","year":2020,"enabled":true},"strictvalidation":true,"exampleextension":"value"}`
      t.strictSame(ceFullStrictSerializedFast, ceFullStrictSerializedFastComparison)
      // deserialization using standard function JSON.parse, so built instance is not a real CloudEvent instance
      const ceFullStrictDeserializedFast = JSON.parse(ceFullStrictSerializedFast) // note that some fields (like dates) will be different when deserialized in this way ...
      // ceFullStrictDeserializedFast.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      ceFullStrictDeserializedFast.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
      t.same(ceFullStrict, ceFullStrictDeserializedFast)
      t.ok(!CloudEvent.isCloudEvent(ceFullStrictDeserializedFast))
      t.ok(!ceFullStrictDeserializedFast.isStrict) // wrong here, but doesn't mattter because is not a real CloudEvent instance
    }

    {
      // additional tests, with bad objects ...
      const ceFullBad = ceFactory.createFullBadIdAndExtension(ceOptionsNoStrict)
      assert(ceFullBad !== null)
      t.ok(ceFullBad)
      t.ok(!ceFullBad.isStrict)
      t.ok(!ceFullBad.isValid())
      const ceFullBadSerializedOnlyValidFalse = ceSerializeFast(ceFullBad, { ...valOnlyValidAllInstance })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullBadSerializedOnlyValidTrue = ceSerializeFast(ceFullBad, { ...valOnlyValidInstance })
        assert(ceFullBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }

    t.end()
  })
})

/** @test {fastifyCloudEvents} */
test('serialize a CloudEvent instance with a non default contenttype and empty serialization options, expect error', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    {
      // create an instance with non default contenttype (other options default): expected success ...
      // but when I try to serialize it without specifying serialization options, expect to have an error raised ...
      const ceFullOtherContentType = ceFactory.createFullDataAsXMLType()
      assert(ceFullOtherContentType !== null)
      t.ok(ceFullOtherContentType)
      t.ok(!ceFullOtherContentType.isStrict)
      t.ok(ceFullOtherContentType.isValid())
      t.throws(function () {
        const ceFullOtherContentTypeSerializedFast = ceSerializeFast(ceFullOtherContentType)
        assert(ceFullOtherContentTypeSerializedFast === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')
      t.throws(function () {
        const ceFullOtherContentTypeSerializedFast = ceSerializeFast(ceFullOtherContentType, { ...valOnlyValidInstance })
        assert(ceFullOtherContentTypeSerializedFast === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')
    }

    {
      // the same but with strict mode enabled ...
      const ceFullOtherContentTypeStrict = ceFactory.createFullDataAsXMLType(ceOptionsStrict)
      assert(ceFullOtherContentTypeStrict !== null)
      t.ok(ceFullOtherContentTypeStrict)
      t.ok(ceFullOtherContentTypeStrict.isStrict)
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
      t.throws(function () {
        const ceFullOtherContentTypeStrictSerialized = ceSerializeFast(ceFullOtherContentTypeStrict, {
          encoder: null,
          encodedData: null,
          ...valOnlyValidInstance
        })
        assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')

      // additional tests, with bad objects ...
      t.throws(function () {
        const ceFullOtherContentTypeStrictSerialized = ceSerializeFast(ceFullOtherContentTypeStrict, {
          encoder: 'encoderSample' // bad encoder function
        })
        assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')
      t.throws(function () {
        const ceFullOtherContentTypeStrictSerialized = ceSerializeFast(ceFullOtherContentTypeStrict, {
          encodedData: true // bad encoded data
        })
        assert(ceFullOtherContentTypeStrictSerialized === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')

      const ceFullOtherContentTypeStrictBad = ceFactory.createFullDataAsXMLType() // create a good instance here
      assert(ceFullOtherContentTypeStrictBad !== null)
      t.ok(ceFullOtherContentTypeStrictBad)
      ceFullOtherContentTypeStrictBad.id = null // remove some mandatory attribute now, to let serialization fail
      t.ok(!ceFullOtherContentTypeStrictBad.isValid())
      const ceFullStrictBadSerializedOnlyValidFalse = CloudEvent.serializeEvent(ceFullOtherContentTypeStrictBad, {
        encodedData: ceDataXMLAsString,
        ...valOnlyValidAllInstance
      })
      t.ok(ceFullStrictBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullStrictBadSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceFullOtherContentTypeStrictBad, {
          encodedData: ceDataXMLAsString,
          ...valOnlyValidInstance
        })
        assert(ceFullStrictBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }

    t.end()
  })
})

// sample encoding function, to use in tests here
function encoderSample () {
  // return ceDataXMLAsString
  return '<data encoder="sample" />'
}

/** @test {CloudEvent} */
test('serialize a CloudEvent instance with a non default contenttype and right serialization options, expect success', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    {
      // create an instance with non default contenttype (other options default): expected success ...
      // when I try to serialize specifying right serialization options, expect success ...
      const ceFullOtherContentType = ceFactory.createFullDataAsXMLType(ceOptionsNoStrict)
      assert(ceFullOtherContentType !== null)
      t.ok(ceFullOtherContentType)
      t.ok(!ceFullOtherContentType.isStrict)
      t.ok(ceFullOtherContentType.isValid())
      t.ok(ceFullOtherContentType.isValid({ ...valOptionsNoOverride }))
      t.ok(ceFullOtherContentType.isValid({ ...valOptionsNoStrict }))
      t.ok(ceFullOtherContentType.isValid({ ...valOptionsStrict }))
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
      // test different combinations of serialization options
      // note that if given, encoder function has priority over encoded data
      const cceFullOtherContentTypeSerialized1 = ceSerializeFast(ceFullOtherContentType, {
        encoder: encoderSample
      })
      t.ok(cceFullOtherContentTypeSerialized1)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
      const cceFullOtherContentTypeSerialized2 = ceSerializeFast(ceFullOtherContentType, {
        encodedData: ceDataXMLAsString
      })
      t.ok(cceFullOtherContentTypeSerialized2)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
      const constEncodedData = '<data "constant"="encoded" />'
      const cceFullOtherContentTypeSerialized3 = ceSerializeFast(ceFullOtherContentType, {
        encoder: encoderSample,
        // encodedData: undefined
        // encodedData: null
        // encodedData: ceDataXMLAsString
        encodedData: constEncodedData
      })
      t.ok(cceFullOtherContentTypeSerialized3)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
      const cceFullOtherContentTypeSerialized4 = ceSerializeFast(ceFullOtherContentType, {
        encoder: encoderSample,
        encodedData: constEncodedData,
        ...valOnlyValidAllInstance
      })
      t.ok(cceFullOtherContentTypeSerialized4)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
      const cceFullOtherContentTypeSerialized5 = ceSerializeFast(ceFullOtherContentType, {
        encoder: encoderSample,
        encodedData: constEncodedData,
        ...valOnlyValidInstance
      })
      t.ok(cceFullOtherContentTypeSerialized5)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentType))
    }

    {
      // the same but with strict mode enabled ...
      const ceFullOtherContentTypeStrict = ceFactory.createFullDataAsXMLType(ceOptionsStrict)
      assert(ceFullOtherContentTypeStrict !== null)
      t.ok(ceFullOtherContentTypeStrict)
      t.ok(ceFullOtherContentTypeStrict.isStrict)
      t.ok(ceFullOtherContentTypeStrict.isValid())
      t.ok(ceFullOtherContentTypeStrict.isValid({ ...valOptionsNoOverride }))
      t.ok(ceFullOtherContentTypeStrict.isValid({ ...valOptionsNoStrict }))
      t.ok(ceFullOtherContentTypeStrict.isValid({ ...valOptionsStrict }))
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
      // test different combinations of serialization options
      // note that if given, encoder function has priority over encoded data
      const ceFullOtherContentTypeStrictSerialized1 = ceSerializeFast(ceFullOtherContentTypeStrict, {
        encoder: encoderSample
      })
      t.ok(ceFullOtherContentTypeStrictSerialized1)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
      const ceFullOtherContentTypeStrictSerialized2 = ceSerializeFast(ceFullOtherContentTypeStrict, {
        encodedData: ceDataXMLAsString
      })
      t.ok(ceFullOtherContentTypeStrictSerialized2)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
      const constEncodedData = '<data "constant"="encoded" />'
      const ceFullOtherContentTypeStrictSerialized3 = ceSerializeFast(ceFullOtherContentTypeStrict, {
        encoder: encoderSample,
        // encodedData: undefined
        // encodedData: null
        // encodedData: ceDataXMLAsString
        encodedData: constEncodedData
      })
      t.ok(ceFullOtherContentTypeStrictSerialized3)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
      const ceFullOtherContentTypeStrictSerialized4 = ceSerializeFast(ceFullOtherContentTypeStrict, {
        encoder: encoderSample,
        encodedData: constEncodedData,
        ...valOnlyValidAllInstance
      })
      t.ok(ceFullOtherContentTypeStrictSerialized4)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
      const ceFullOtherContentTypeStrictSerialized5 = ceSerializeFast(ceFullOtherContentTypeStrict, {
        encoder: encoderSample,
        encodedData: constEncodedData,
        ...valOnlyValidInstance
      })
      t.ok(ceFullOtherContentTypeStrictSerialized5)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))
    }

    t.end()
  })
})

/** @test {fastifyCloudEvents} */
test('ensure the JSON Schema for a CloudEvent (static and for a normal instance) is available', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)

    // get JSON Schema from a static method
    const jsonSchemaStatic = CloudEvent.getJSONSchema()
    assert(jsonSchemaStatic !== null)
    t.ok(jsonSchemaStatic)
    t.equal(typeof jsonSchemaStatic, 'object')

    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)
    const ceFullStrict = ceFactory.createFull(ceOptionsStrict)
    assert(ceFullStrict !== null)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isStrict)
    // get JSON Schema from that instance
    const jsonSchema = ceFullStrict.schema
    assert(jsonSchema !== null)
    t.ok(jsonSchema)
    t.equal(typeof jsonSchema, 'object')

    const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict)
    t.ok(ceFullStrictSerializedFast)
    // ensure schema is always the same
    t.strictSame(jsonSchemaStatic, jsonSchema)

    t.end()
  })
})

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON with nested data, and ensure they are right', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    {
      const ceFull = ceFactory.createFullNestedData(ceOptionsNoStrict)
      assert(ceFull !== null)
      t.ok(ceFull)
      t.ok(!ceFull.isStrict)
      t.ok(ceFull.isValid())
      t.ok(ceFull.validate().length === 0)
      t.ok(ceFull.validate({ ...valOptionsNoStrict }).length === 0)
      t.ok(ceFull.validate({ ...valOptionsStrict }).length === 0)
      t.ok(CloudEvent.isValidEvent(ceFull))
      t.ok(CloudEvent.validateEvent(ceFull).length === 0)
      t.ok(CloudEvent.validateEvent(ceFull, { ...valOptionsNoStrict }).length === 0)
      t.ok(CloudEvent.validateEvent(ceFull, { ...valOptionsStrict }).length === 0)

      const ceFullSerialized = ceSerializeFast(ceFull)
      t.ok(ceFullSerialized)

      const ceFullSerializedComparison = `{"specversion":"1.0","id":"3/full-no-strict-nested-data","type":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent-v1.0.0","source":"/test","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${commonEventTime.toISOString()}","subject":"subject","data":{"hello":"world","year":2020,"enabled":true,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"exampleextension":"value"}`
      t.strictSame(ceFullSerialized, ceFullSerializedComparison)
      // deserialization using standard function JSON.parse, so built instance is not a real CloudEvent instance
      const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
      // ceFullDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      ceFullDeserialized.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
      t.same(ceFull, ceFullDeserialized)
      t.ok(!CloudEvent.isCloudEvent(ceFullDeserialized))
      t.ok(!ceFullDeserialized.isStrict) // ok here, but doesn't mattter because is not a real CloudEvent instance

      // ensure payload data is a copy of event data
      let dataShallowClone = ceFull.payload
      // then ensure they are different object (references) ...
      assert(dataShallowClone !== null)
      assert(dataShallowClone !== ceFull.data) // they must be different object references
      assert(dataShallowClone !== ceFull.payload) // they must be different object references, at any invocation
      t.not(dataShallowClone, ceFull.data)
      t.not(dataShallowClone, ceFull.data)
      t.not(dataShallowClone, ceFull.payload)
      dataShallowClone = 'changed: true' // reassign to test that data won't be affected by that change
      t.not(dataShallowClone, ceFull.data)
      t.strictNotSame(dataShallowClone, ceFull.data)
      t.not(dataShallowClone, ceFull.payload)

      const ceFullSerializedOnlyValidFalse = ceSerializeFast(ceFull, { ...valOnlyValidAllInstance })
      t.ok(ceFullSerializedOnlyValidFalse)
      const ceFullSerializedOnlyValidTrue = ceSerializeFast(ceFull, { ...valOnlyValidInstance })
      t.ok(ceFullSerializedOnlyValidTrue)
    }

    {
      // the same but with strict mode enabled ...
      const ceFullStrict = ceFactory.createFullNestedData(ceOptionsStrict)
      assert(ceFullStrict !== null)
      t.ok(ceFullStrict)
      t.ok(ceFullStrict.isStrict)
      t.ok(ceFullStrict.isValid())
      t.ok(ceFullStrict.validate().length === 0)
      t.ok(ceFullStrict.validate({ ...valOptionsStrict }).length === 0)
      t.ok(ceFullStrict.validate({ ...valOptionsNoStrict }).length === 0)
      t.ok(CloudEvent.isValidEvent(ceFullStrict))
      t.ok(CloudEvent.validateEvent(ceFullStrict).length === 0)
      t.ok(CloudEvent.validateEvent(ceFullStrict, { ...valOptionsStrict }).length === 0)
      t.ok(CloudEvent.validateEvent(ceFullStrict, { ...valOptionsNoStrict }).length === 0)

      const ceFullStrictSerialized = ceSerializeFast(ceFullStrict)
      t.ok(ceFullStrictSerialized)

      const ceFullStrictSerializedComparison = `{"specversion":"1.0","id":"3/full-no-strict-nested-data","type":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent-v1.0.0","source":"/test","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${commonEventTime.toISOString()}","subject":"subject","data":{"hello":"world","year":2020,"enabled":true,"nested1":{"level1attribute":"level1attributeValue","nested2":{"level2attribute":"level2attributeValue","nested3":{"level3attribute":"level3attributeValue"}}}},"strictvalidation":true,"exampleextension":"value"}`
      t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
      // deserialization using standard function JSON.parse, so built instance is not a real CloudEvent instance
      const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
      // ceFullStrictDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      ceFullStrictDeserialized.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
      t.same(ceFullStrict, ceFullStrictDeserialized)
      t.ok(!CloudEvent.isCloudEvent(ceFullStrictDeserialized))
      t.ok(!ceFullStrictDeserialized.isStrict) // wrong here, but doesn't mattter because is not a real CloudEvent instance

      // ensure payload data is a copy of event data
      let dataShallowCloneStrict = ceFullStrict.payload
      // then ensure they are different object (references) ...
      assert(dataShallowCloneStrict !== null)
      assert(dataShallowCloneStrict !== ceFullStrict.data) // they must be different object references
      assert(dataShallowCloneStrict !== ceFullStrict.payload) // they must be different object references, at any invocation
      t.not(dataShallowCloneStrict, ceFullStrict.data)
      t.not(dataShallowCloneStrict, ceFullStrict.data)
      t.not(dataShallowCloneStrict, ceFullStrict.payload)
      dataShallowCloneStrict = 'changed: true' // reassign to test that data won't be affected by that change
      t.not(dataShallowCloneStrict, ceFullStrict.data)
      t.strictNotSame(dataShallowCloneStrict, ceFullStrict.data)
      t.not(dataShallowCloneStrict, ceFullStrict.payload)

      const ceFullStrictSerializedOnlyValidFalse = ceSerializeFast(ceFullStrict, { ...valOnlyValidAllInstance, ...valDebugInfoEnable })
      t.ok(ceFullStrictSerializedOnlyValidFalse)
      const ceFullStrictSerializedOnlyValidTrue = ceSerializeFast(ceFullStrict, { ...valOnlyValidInstance, ...valDebugInfoDisable })
      t.ok(ceFullStrictSerializedOnlyValidTrue)
    }

    t.end()
  })
})

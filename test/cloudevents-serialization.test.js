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
const Fastify = require('fastify')

/** @test {CloudEvent} */
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  t.plan(6)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
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
  })
})

// import some common test data
const {
  commonEventTime,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonExtensions,
  // ceExtensionStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData
  // ceMapData
} = require('./common-test-data')

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  t.plan(45)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceIsValid = CloudEvent.isValidEvent
    t.ok(ceIsValid)
    const ceValidate = CloudEvent.validateEvent
    t.ok(ceValidate)
    const ceSerialize = CloudEvent.serializeEvent
    t.ok(ceSerialize)

    {
      // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
      // note that null values are not handled by default values, only undefined values ...
      const ceFull = new CloudEvent('1/full/sample-data/no-strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        ceCommonOptions,
        ceCommonExtensions
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

      const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
      t.ok(ceFullSerializedStatic)
      const ceFullSerialized = ceFull.serialize()
      t.ok(ceFullSerialized)
      assert(ceFullSerializedStatic === ceFullSerialized)
      t.strictSame(ceFullSerializedStatic, ceFullSerialized)
      // const ceSerialize = CloudEvent.serializeEvent
      assert(ceSerialize !== null)
      t.ok(ceSerialize)
      const ceFullSerializedFunction = ceSerialize(ceFull)
      t.ok(ceFullSerializedFunction)
      t.strictSame(ceFullSerializedFunction, ceFullSerializedStatic)
      t.strictSame(ceFullSerializedFunction, ceFullSerialized)

      const ceFullSerializedComparison = `{"id":"1/full/sample-data/no-strict","type":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent","source":"/test","data":{"hello":"world","year":2019},"specversion":"0.3","datacontenttype":"application/json","time":"${commonEventTime.toISOString()}","schemaurl":"http://my-schema.localhost.localdomain","subject":"subject","exampleExtension":"value"}`
      t.strictSame(ceFullSerialized, ceFullSerializedComparison)
      const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
      ceFullDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      ceFullDeserialized.datacontentencoding = undefined // quick fix for this not so common attribute in the deserialized object
      t.same(ceFull, ceFullDeserialized)
    }

    {
      // the same but with strict mode enabled ...
      const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        ceCommonOptionsStrict,
        ceCommonExtensions
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

      const ceFullStrictSerializedStatic = CloudEvent.serializeEvent(ceFullStrict)
      t.ok(ceFullStrictSerializedStatic)
      const ceFullStrictSerialized = ceFullStrict.serialize()
      t.ok(ceFullStrictSerialized)
      assert(ceFullStrictSerializedStatic === ceFullStrictSerialized)
      t.strictSame(ceFullStrictSerializedStatic, ceFullStrictSerialized)
      // const ceSerialize = CloudEvent.serializeEvent
      assert(ceSerialize !== null)
      t.ok(ceSerialize)
      const ceFullStrictSerializedFunction = ceSerialize(ceFullStrict)
      t.ok(ceFullStrictSerializedFunction)
      t.strictSame(ceFullStrictSerializedFunction, ceFullStrictSerializedStatic)
      t.strictSame(ceFullStrictSerializedFunction, ceFullStrictSerialized)

      const ceFullStrictSerializedComparison = `{"id":"1/full/sample-data/strict","type":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent","source":"/test","data":{"hello":"world","year":2019},"specversion":"0.3","datacontenttype":"application/json","time":"${commonEventTime.toISOString()}","schemaurl":"http://my-schema.localhost.localdomain","subject":"subject","com_github_smartiniOnGitHub_cloudevent":{"strict":true},"exampleExtension":"value"}`
      t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
      const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
      ceFullStrictDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      ceFullStrictDeserialized.datacontentencoding = undefined // quick fix for this not so common attribute in the deserialized object
      t.same(ceFullStrict, ceFullStrictDeserialized)
    }

    {
      // additional tests, with bad objects ...
      const ceFullBad = new CloudEvent(null,
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        ceCommonOptions,
        {} // extensions
      )
      assert(ceFullBad !== null)
      t.ok(ceFullBad)
      t.ok(!ceFullBad.isValid())
      const ceFullBadSerializedOnlyValidFalse = ceSerialize(ceFullBad, { onlyValid: false })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullBadSerializedOnlyValidTrue = ceSerialize(ceFullBad, { onlyValid: true })
        assert(ceFullBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }
  })
})

// sample decoding function, to use in tests here
function decoderSample () {
  // return { hello: 'world', year: 2019 }
  return { decoded: 'Sample' }
}

/** @test {CloudEvent} */
test('serialize/deserialize a CloudEvent instance with a non default contenttype, and ensure they are right', (t) => {
  t.plan(23)

  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)

    const fixedEncodedData = '<data "fixed"="encoded" />'
    const fixedDecodedData = { fixed: 'encoded' }

    {
      // serialization tests
      // create an instance with non default contenttype (other options default): expected success ...
      const ceFullOtherContentType = new CloudEvent('1/non-default-contenttype/sample-data/no-strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          datacontenttype: 'application/xml'
        }
      )
      assert(ceFullOtherContentType !== null)
      t.ok(ceFullOtherContentType)
      t.ok(ceFullOtherContentType.isValid())
      t.ok(!ceFullOtherContentType.isValid({ strict: true }))
      // when I try to serialize it (without serialization options), expect to have an error raised ...
      t.throws(function () {
        const ceFullOtherContentTypeSerialized = ceFullOtherContentType.serialize()
        assert(ceFullOtherContentTypeSerialized === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')
      // when I try to serialize it (with right serialization options), expect success ...
      const ceFullOtherContentTypeSerialized = ceFullOtherContentType.serialize({
        // encoder: encoderSample,
        encodedData: fixedEncodedData,
        onlyValid: true
      })
      assert(ceFullOtherContentTypeSerialized !== null)
      t.ok(ceFullOtherContentTypeSerialized)

      // deserialization tests
      const serialized = ceFullOtherContentTypeSerialized
      // when I try to deserialize it (without deserialization options), expect to have an error raised ...
      t.throws(function () {
        const ceFullOtherContentTypeDeserialized1 = CloudEvent.deserializeEvent(serialized)
        assert(ceFullOtherContentTypeDeserialized1 === null) // never executed
      }, Error, 'Expected exception when deserializing the current CloudEvent instance')
      // when I try to serialize it (with right serialization options), expect success ...
      const ceFullOtherContentTypeDeserialized2 = CloudEvent.deserializeEvent(serialized, {
        decodedData: { hello: 'world', year: 2019 }
      })
      t.ok(ceFullOtherContentTypeDeserialized2)
      const ceFullOtherContentTypeDeserialized5 = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderSample,
        decodedData: fixedDecodedData,
        onlyValid: true
      })
      t.ok(ceFullOtherContentTypeDeserialized5)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeDeserialized5, { strict: false }))
      t.ok(!CloudEvent.isValidEvent(ceFullOtherContentTypeDeserialized5, { strict: true }))
      t.ok(CloudEvent.isCloudEvent(ceFullOtherContentTypeDeserialized5))
    }

    {
      // the same but with strict mode enabled ...
      // serialization tests
      const ceFullOtherContentTypeStrict = new CloudEvent('1/non-default-contenttype/sample-data/strict',
        ceNamespace,
        ceServerUrl,
        ceCommonData, // data
        {
          ...ceCommonOptionsStrict,
          datacontenttype: 'application/xml'
        }
      )
      assert(ceFullOtherContentTypeStrict !== null)
      t.ok(ceFullOtherContentTypeStrict)
      t.ok(ceFullOtherContentTypeStrict.isValid())
      t.ok(ceFullOtherContentTypeStrict.isValid({ strict: true }))
      const ceFullOtherContentTypeStrictSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        // encoder: encoderSample,
        encodedData: fixedEncodedData,
        onlyValid: true
      })
      t.ok(ceFullOtherContentTypeStrictSerialized5)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeStrict))

      // deserialization tests
      const serialized = ceFullOtherContentTypeStrictSerialized5
      // when I try to deserialize it (without deserialization options), expect to have an error raised ...
      t.throws(function () {
        const ceFullOtherContentTypeDeserialized1 = CloudEvent.deserializeEvent(serialized)
        assert(ceFullOtherContentTypeDeserialized1 === null) // never executed
      }, Error, 'Expected exception when deserializing the current CloudEvent instance')
      // when I try to serialize it (with right serialization options), expect success ...
      const ceFullOtherContentTypeDeserialized2 = CloudEvent.deserializeEvent(serialized, {
        decodedData: { hello: 'world', year: 2019 }
      })
      t.ok(ceFullOtherContentTypeDeserialized2)
      const ceFullOtherContentTypeDeserialized5 = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderSample,
        decodedData: fixedDecodedData,
        onlyValid: true
      })
      t.ok(ceFullOtherContentTypeDeserialized5)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeDeserialized5, { strict: true }))
      t.ok(CloudEvent.isCloudEvent(ceFullOtherContentTypeDeserialized5))
    }
  })
})

/** @test {CloudEvent} */
test('ensure JSONBatch decorator function (exposed by the plugin) exists, and related serialization/deserialization functions', (t) => {
  t.plan(9)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)

    // ensure JSONBatch class exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('JSONBatch'))
    const JSONBatch = fastify.JSONBatch
    // optional, add some assertions with standard Node.js assert statements, as a sample
    assert(JSONBatch !== null)
    assert(typeof JSONBatch === 'function')
    assert.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')
    t.ok(JSONBatch)
    t.strictEqual(typeof JSONBatch, 'function')
    t.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')

    // ensure JSONBatch serialization/deserialization functions exists ...
    const batchSerialize = JSONBatch.serializeEvents
    assert(batchSerialize !== null)
    assert(typeof batchSerialize === 'function')
    t.ok(batchSerialize)
    t.strictEqual(typeof batchSerialize, 'function')

    const batchDeserialize = JSONBatch.deserializeEvents
    assert(batchDeserialize !== null)
    assert(typeof batchDeserialize === 'function')
    t.ok(batchDeserialize)
    t.strictEqual(typeof batchDeserialize, 'function')
  })
})

/** @test {CloudEvent} */
test('ensure JSONBatch serialization/deserialization functions works good', (t) => {
  t.plan(13)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)

    // ensure JSONBatch class exist in Fastify decorators ...
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const JSONBatch = fastify.JSONBatch
    t.ok(JSONBatch)

    // build some example CloudEvent instance ...
    const ceFull = new CloudEvent('1/full',
      ceNamespace,
      ceServerUrl,
      // ceCommonData,
      'sample data', // data as string, to let this ce instance have some strict validation errors
      ceCommonOptions,
      // ceCommonExtensions
      {} // extensions as empty object, to let this ce instance have some strict validation errors
    )
    const ceFullStrict = new CloudEvent('1/full-strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    // define an array containing different CloudEvent instances, and even other objects ...
    const arr = [
      undefined,
      null,
      'string',
      1234567890,
      false,
      true,
      ceFull,
      new Date(),
      {},
      [],
      ceFullStrict,
      null,
      undefined
    ]

    // in following tests to simplify comparison of results, do only some brief checks ...
    const ser = JSONBatch.serializeEvents(arr, { prettyPrint: true, logError: true })
    // console.log(`DEBUG: serialized JSONBatch (prettyPrint enabled) = ${ser}`)
    t.ok(ser)

    const events = JSONBatch.getEvents(arr, {
      onlyValid: true,
      strict: false
    })
    // console.log(`DEBUG: events JSONBatch length = ${events.length}, summary: ${events}`)
    // console.log(`DEBUG: events JSONBatch length = ${events.length}, details: ${JSON.stringify(events)}`)
    t.ok(events)
    t.strictSame(events.length, 2)

    const deser = JSONBatch.deserializeEvents(ser, {
      logError: true,
      throwError: true,
      onlyValid: true // sample, to filter out not valid serialized instances ...
      // onlyIfLessThan64KB: true // to force throw here ...
    })
    // console.log(`DEBUG: deserialized JSONBatch length = ${deser.length}, summary: ${deser}`)
    // console.log(`DEBUG: deserialized JSONBatch length = ${deser.length}, details: ${JSON.stringify(deser)}`)
    t.ok(deser)
    t.strictSame(deser.length, 2)

    // ensure events and deser contains similar CloudEvent instances
    t.strictSame(events.length, deser.length)
    events.forEach((e, i) => t.ok(e.id === deser[i].id)) // this count events.length tests ...
    events.forEach((e, i) => t.ok(e.isStrict === deser[i].isStrict)) // this count events.length tests ...
  })
})

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
const test = require('tap').test
const Fastify = require('fastify')

// get factory for instances to test
const ceFactory = require('./common-test-factory')

// import some common test data
// const td = require('./common-test-data')
const {
  // ceDataAsJSONString,
  ceDataAsString,
  ceDataAsStringEncoded,
  ceOptionsNoStrict,
  ceOptionsStrict,
  commonEventTime,
  valDebugInfoDisable,
  valDebugInfoEnable,
  // valExcludeExtensionsDisable,
  // valExcludeExtensionsEnable,
  valOnlyValidAllInstance,
  valOnlyValidInstance,
  valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
} = require('./common-test-data')

/** @test {CloudEvent} */
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  // t.plan(6)
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err) => {
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

    t.end()
  })
})

/** @test {CloudEvent} */
test('serialize some CloudEvent instances to JSON, and ensure they are right', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err) => {
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
      const ceFull = ceFactory.createFull(ceOptionsNoStrict)
      assert(ceFull !== null)
      t.ok(ceFull)
      t.ok(!ceFull.isStrict)
      t.ok(ceFull.isValid())
      t.ok(ceFull.validate().length === 0)
      t.ok(ceFull.validate({ ...valOptionsNoStrict }).length === 0)
      t.ok(ceFull.validate({ ...valOptionsStrict }).length === 0)
      t.ok(ceIsValid(ceFull))
      t.ok(ceValidate(ceFull).length === 0)
      t.ok(ceValidate(ceFull, { ...valOptionsNoStrict }).length === 0)
      t.ok(ceValidate(ceFull, { ...valOptionsStrict }).length === 0)

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

      const ceFullSerializedComparison = `{"id":"2/full","type":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent-v1.0.0","source":"/test","data":{"hello":"world","year":2020,"enabled":true},"specversion":"1.0","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${commonEventTime.toISOString()}","subject":"subject","exampleextension":"value"}`
      t.strictSame(ceFullSerialized, ceFullSerializedComparison)
      // deserialization using standard function JSON.parse, so built instance is not a real CloudEvent instance
      const ceFullDeserialized = JSON.parse(ceFullSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
      // ceFullDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      ceFullDeserialized.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
      t.same(ceFull, ceFullDeserialized)
      t.ok(!CloudEvent.isCloudEvent(ceFullDeserialized))
      t.ok(!ceFullDeserialized.isStrict) // ok here, but doesn't mattter because is not a real CloudEvent instance
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
      t.ok(ceIsValid(ceFullStrict))
      t.ok(ceValidate(ceFullStrict).length === 0)
      t.ok(ceValidate(ceFullStrict, { ...valOptionsStrict }).length === 0)
      t.ok(ceValidate(ceFullStrict, { ...valOptionsNoStrict }).length === 0)

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

      const ceFullStrictSerializedComparison = `{"id":"2/full","type":"com.github.smartiniOnGitHub.fastify-cloudevents.testevent-v1.0.0","source":"/test","data":{"hello":"world","year":2020,"enabled":true},"specversion":"1.0","datacontenttype":"application/json","dataschema":"http://my-schema.localhost.localdomain/v1/","time":"${commonEventTime.toISOString()}","subject":"subject","strictvalidation":true,"exampleextension":"value"}`
      t.strictSame(ceFullStrictSerialized, ceFullStrictSerializedComparison)
      // deserialization using standard function JSON.parse, so built instance is not a real CloudEvent instance
      const ceFullStrictDeserialized = JSON.parse(ceFullStrictSerialized) // note that some fields (like dates) will be different when deserialized in this way ...
      // ceFullStrictDeserialized.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
      ceFullStrictDeserialized.data_base64 = undefined // quick fix for this not so common attribute in the deserialized object
      t.same(ceFullStrict, ceFullStrictDeserialized)
      t.ok(!CloudEvent.isCloudEvent(ceFullStrictDeserialized))
      t.ok(!ceFullStrictDeserialized.isStrict) // wrong here, but doesn't mattter because is not a real CloudEvent instance
    }

    {
      // additional tests, with bad objects ...
      const ceFullBad = ceFactory.createFullBadIdAndExtension()
      assert(ceFullBad !== null)
      t.ok(ceFullBad)
      t.ok(!ceFullBad.isStrict)
      t.ok(!ceFullBad.isValid())
      const ceFullBadSerializedOnlyValidFalse = ceSerialize(ceFullBad, { ...valOnlyValidAllInstance })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      t.throws(function () {
        const ceFullBadSerializedOnlyValidTrue = ceSerialize(ceFullBad, { ...valOnlyValidInstance })
        assert(ceFullBadSerializedOnlyValidTrue === null) // never executed
      }, Error, 'Expected exception when serializing a bad CloudEvent instance')
    }

    t.end()
  })
})

// sample decoding function, to use in tests here
function decoderSample () {
  // return { hello: 'world', year: 2020 }
  return { decoded: 'Sample' }
}

// reference some imported variables, even when not used, mainly to avoid linting errors
assert(valDebugInfoDisable !== null)
assert(valDebugInfoEnable !== null)

/** @test {CloudEvent} */
test('serialize/deserialize a CloudEvent instance with a non default contenttype, and ensure they are right', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)

    const fixedEncodedData = '<data "fixed"="encoded" />'
    const fixedDecodedData = { fixed: 'encoded' }

    {
      // serialization tests
      // create an instance with non default contenttype (other options default): expected success ...
      const ceFullOtherContentType = ceFactory.createFullDataAsXMLType(ceOptionsNoStrict)
      assert(ceFullOtherContentType !== null)
      t.ok(ceFullOtherContentType)
      t.ok(!ceFullOtherContentType.isStrict)
      // console.log(`DEBUG - dump validation errors: ${CloudEvent.dumpValidationResults(ceFullOtherContentType)}`)
      t.ok(ceFullOtherContentType.isValid())
      // console.log(`DEBUG - dump validation errors: ${CloudEvent.dumpValidationResults(ceFullOtherContentType, { ...valOptionsStrict })}`)
      t.ok(ceFullOtherContentType.isValid({ ...valOptionsStrict }))
      // when I try to serialize it (without serialization options), expect to have an error raised ...
      t.throws(function () {
        const ceFullOtherContentTypeSerialized = ceFullOtherContentType.serialize()
        assert(ceFullOtherContentTypeSerialized === null) // never executed
      }, Error, 'Expected exception when serializing the current CloudEvent instance')
      // when I try to serialize it (with right serialization options), expect success ...
      const ceFullOtherContentTypeSerialized = ceFullOtherContentType.serialize({
        // encoder: encoderSample,
        encodedData: fixedEncodedData,
        ...valOnlyValidInstance
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
        decodedData: { hello: 'world', year: 2020 }
      })
      t.ok(ceFullOtherContentTypeDeserialized2)
      const ceFullOtherContentTypeDeserialized5 = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderSample,
        decodedData: fixedDecodedData,
        ...valOnlyValidInstance
      })
      t.ok(ceFullOtherContentTypeDeserialized5)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeDeserialized5, { ...valOptionsNoStrict }))
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeDeserialized5, { ...valOptionsStrict }))
      t.ok(CloudEvent.isCloudEvent(ceFullOtherContentTypeDeserialized5))
    }

    {
      // the same but with strict mode enabled ...
      // serialization tests
      const ceFullOtherContentTypeStrict = ceFactory.createFullDataAsXMLType(ceOptionsStrict)
      assert(ceFullOtherContentTypeStrict !== null)
      t.ok(ceFullOtherContentTypeStrict)
      t.ok(ceFullOtherContentTypeStrict.isStrict)
      t.ok(ceFullOtherContentTypeStrict.isValid())
      t.ok(ceFullOtherContentTypeStrict.isValid({ ...valOptionsStrict }))
      const ceFullOtherContentTypeStrictSerialized5 = CloudEvent.serializeEvent(ceFullOtherContentTypeStrict, {
        // encoder: encoderSample,
        encodedData: fixedEncodedData,
        ...valOnlyValidInstance
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
        decodedData: { hello: 'world', year: 2020 }
      })
      t.ok(ceFullOtherContentTypeDeserialized2)
      const ceFullOtherContentTypeDeserialized5 = CloudEvent.deserializeEvent(serialized, {
        decoder: decoderSample,
        decodedData: fixedDecodedData,
        ...valOnlyValidInstance
      })
      t.ok(ceFullOtherContentTypeDeserialized5)
      t.ok(CloudEvent.isValidEvent(ceFullOtherContentTypeDeserialized5, { ...valOptionsStrict }))
      t.ok(CloudEvent.isCloudEvent(ceFullOtherContentTypeDeserialized5))
    }

    {
      // use directly the event with strict mode enabled ...
      const ceStrict = ceFactory.createFullTextData(ceOptionsStrict)
      assert(ceStrict !== null)
      t.ok(ceStrict)
      t.ok(ceStrict.isStrict)
      // console.log(`DEBUG | cloudEvent details: ${JSON.stringify(ceStrict)}`)
      t.ok(CloudEvent.isValidEvent(ceStrict, { ...valOptionsNoOverride, ...valDebugInfoEnable }))
      t.strictSame(ceStrict.payload, ceStrict.data)
      t.strictSame(ceStrict.dataType, 'Text')
      const ceSerializedOnlyValidTrue = CloudEvent.serializeEvent(ceStrict, { ...valOnlyValidInstance })
      t.ok(ceSerializedOnlyValidTrue)
      // console.log(`DEBUG - ceStrict serialized:\n${ceSerializedOnlyValidTrue}`)
      const ceDeserializedOnlyValidTrue = CloudEvent.deserializeEvent(ceSerializedOnlyValidTrue)
      t.ok(ceDeserializedOnlyValidTrue)
      // console.log(`DEBUG - cloudEvent details: ${JSON.stringify(ceDeserializedOnlyValidTrue)}`)
      const ceStrictAsString = ceStrict.toString()
      // console.log(`DEBUG - ceStrictAsString: ${ceStrictAsString}`)
      t.ok(ceStrictAsString != null && (typeof ceStrictAsString === 'string'))
      const ceStrictPayloadDumped = JSON.stringify(ceStrict.payload)
      // console.log(`DEBUG - ceStrictPayloadDumped: ${ceStrictPayloadDumped}`)
      t.ok(ceStrictPayloadDumped != null && (typeof ceStrictPayloadDumped === 'string'))
      t.ok(ceStrictPayloadDumped.length < 1024)
    }

    t.end()
  })
})

/** @test {CloudEvent} */
test('ensure JSONBatch decorator function (exposed by the plugin) exists, and related serialization/deserialization functions', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err) => {
    t.error(err)

    // ensure JSONBatch class exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('JSONBatch'))
    const JSONBatch = fastify.JSONBatch
    // optional, add some assertions with standard Node.js assert statements, as a sample
    assert(JSONBatch !== null)
    assert(typeof JSONBatch === 'function')
    assert.strictEqual(JSONBatch.mediaType(), 'application/cloudevents-batch+json')
    t.ok(JSONBatch)
    t.equal(typeof JSONBatch, 'function')
    t.equal(JSONBatch.mediaType(), 'application/cloudevents-batch+json')

    // ensure JSONBatch serialization/deserialization functions exists ...
    const batchSerialize = JSONBatch.serializeEvents
    assert(batchSerialize !== null)
    assert(typeof batchSerialize === 'function')
    t.ok(batchSerialize)
    t.equal(typeof batchSerialize, 'function')

    const batchDeserialize = JSONBatch.deserializeEvents
    assert(batchDeserialize !== null)
    assert(typeof batchDeserialize === 'function')
    t.ok(batchDeserialize)
    t.equal(typeof batchDeserialize, 'function')

    t.end()
  })
})

/** @test {CloudEvent} */
test('ensure JSONBatch serialization/deserialization functions works good', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err) => {
    t.error(err)

    // ensure JSONBatch class exist in Fastify decorators ...
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const JSONBatch = fastify.JSONBatch
    t.ok(JSONBatch)

    // build some example CloudEvent instance ...
    const ceFull = ceFactory.createFullTextDataBadContentType() // ce with some strict validation errors
    t.ok(ceFull)
    t.ok(!ceFull.isStrict)
    const ceFullStrict = ceFactory.createFull(ceOptionsStrict)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isStrict)
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
      ...valOnlyValidInstance,
      ...valOptionsNoStrict
    })
    // console.log(`DEBUG: events JSONBatch length = ${events.length}, summary: ${events}`)
    // console.log(`DEBUG: events JSONBatch length = ${events.length}, details: ${JSON.stringify(events)}`)
    t.ok(events)
    t.strictSame(events.length, 2)

    const deser = JSONBatch.deserializeEvents(ser, {
      logError: true,
      throwError: true,
      ...valOnlyValidInstance // sample, to filter out not valid serialized instances ...
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

    t.end()
  })
})

// some utility function, for checks
function isClass (arg, classReference) {
  return (arg instanceof classReference)
}
function isString (arg) {
  return ((arg !== undefined && arg !== null) && (typeof arg === 'string'))
}
function isDate (arg) {
  return ((arg !== undefined && arg !== null) && (typeof arg === 'object' || arg instanceof Date))
}
function isDateValid (arg) {
  return (isDate(arg) && !isNaN(arg))
}
function isDatePast (arg) {
  return (isDateValid(arg) && arg.getTime() <= Date.now())
}

/** @test {CloudEvent} */
test('serialize some CloudEvent instances with data encoded in base64 to JSON, and ensure they are right', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceIsValid = CloudEvent.isValidEvent
    t.ok(ceIsValid)
    const ceValidate = CloudEvent.validateEvent
    t.ok(ceValidate)
    const ceSerialize = CloudEvent.serializeEvent
    t.ok(ceSerialize)
    const CloudEventTransformer = fastify.CloudEventTransformer
    t.ok(CloudEventTransformer)

    const ceDataEncoded = ceDataAsStringEncoded

    {
      const ceFull = ceFactory.createFullBinaryData()
      t.ok(ceFull)
      t.ok(!ceFull.isStrict)
      t.ok(ceIsValid(ceFull, { ...valOptionsNoStrict }))
      t.ok(ceIsValid(ceFull, { ...valOptionsStrict }))
      t.strictSame(ceValidate(ceFull, { ...valOptionsNoStrict }).length, 0)
      t.strictSame(ceValidate(ceFull, { ...valOptionsStrict }).length, 0)
      t.strictSame(CloudEventTransformer.stringFromBase64(ceDataEncoded), ceDataAsString)
      t.strictSame(CloudEventTransformer.stringToBase64(CloudEventTransformer.stringFromBase64(ceDataEncoded)), ceDataEncoded)
      t.strictSame(CloudEventTransformer.stringToBase64(ceDataAsString), ceDataEncoded)
      t.strictSame(CloudEventTransformer.stringFromBase64(CloudEventTransformer.stringToBase64(ceDataAsString)), ceDataAsString)

      const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFull)
      // console.log(`DEBUG - cloudEvent details: ${CloudEventTransformer.dumpObject(ceFullSerializedStatic, 'ceFullSerializedStatic')}`)
      t.ok(ceFullSerializedStatic)
      const ceFullSerialized = ceFull.serialize()
      t.ok(ceFullSerialized)
      t.strictSame(ceFullSerializedStatic, ceFullSerialized)
      // const ceSerialize = CloudEvent.serializeEvent
      t.ok(ceSerialize)
      const ceFullSerializedFunction = ceSerialize(ceFull)
      t.ok(ceFullSerializedFunction)
      t.strictSame(ceFullSerializedFunction, ceFullSerializedStatic)
      t.strictSame(ceFullSerializedFunction, ceFullSerialized)
      const ceFullSerializedOnlyValidFalse = ceSerialize(ceFull, { ...valOnlyValidAllInstance })
      t.ok(ceFullSerializedOnlyValidFalse)
      const ceFullSerializedOnlyValidTrue = ceSerialize(ceFull, { ...valOnlyValidInstance })
      t.ok(ceFullSerializedOnlyValidTrue)

      const ceDeserialized = CloudEvent.deserializeEvent(ceFullSerializedStatic)
      // console.log(`DEBUG - cloudEvent details: ${CloudEventTransformer.dumpObject(ceDeserialized, 'ceDeserialized')}`)
      // console.log(`DEBUG - cloudEvent validation: ${ceDeserialized.validate()}`)
      // console.log(`DEBUG - cloudEvent validation (strict): ${ceDeserialized.validate({ ...valOptionsStrict })}`)
      t.ok(ceDeserialized)
      t.ok(isClass(ceDeserialized, CloudEvent))
      t.ok(ceDeserialized.isValid())
      t.ok(ceDeserialized.validate().length === 0)
      t.ok(ceDeserialized.validate({ ...valOptionsNoStrict }).length === 0)
      t.ok(ceDeserialized.validate({ ...valOptionsStrict }).length === 0)
      t.ok(ceIsValid(ceDeserialized))
      t.ok(ceValidate(ceDeserialized).length === 0)
      t.ok(ceValidate(ceDeserialized, { ...valOptionsNoStrict }).length === 0)
      t.ok(ceValidate(ceDeserialized, { ...valOptionsStrict }).length === 0)
      t.ok(CloudEvent.isCloudEvent(ceDeserialized))

      // inspect content of deserialized CloudEvent, at least on some attributes
      t.ok(ceDeserialized.time)
      const ceDeserializedTimeAsDate = ceDeserialized.timeAsDate
      t.ok(ceDeserializedTimeAsDate)
      t.ok(isDate(ceDeserializedTimeAsDate))
      t.ok(isDateValid(ceDeserializedTimeAsDate))
      t.ok(isDatePast(ceDeserializedTimeAsDate))
      t.strictSame(ceDeserializedTimeAsDate.getTime(), commonEventTime.getTime())
      t.not(ceDeserializedTimeAsDate, commonEventTime)
      t.not(ceDeserialized.time, commonEventTime)
      // console.log(`DEBUG - cloudEvent data: ${CloudEventTransformer.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
      // console.log(`DEBUG - cloudEvent data_base64: ${CloudEventTransformer.dumpObject(ceDeserialized.data_base64, 'ceDeserialized.data_base64')}`)
      // console.log(`DEBUG - cloudEvent payload: ${CloudEventTransformer.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
      t.ok(ceDeserialized.data_base64)
      t.ok(isString(ceDeserialized.data_base64))
      t.ok(ceDeserialized.payload)
      t.ok(isString(ceDeserialized.payload))
      // then ensure the value of both are the same ...
      t.strictNotSame(ceDeserialized.payload, ceDeserialized.data)
      t.strictSame(ceDeserialized.payload, CloudEventTransformer.stringFromBase64(ceDeserialized.data_base64))
      // and that they are the same of initial value ...
      t.strictSame(ceDeserialized.data, ceFull.data)
      t.strictNotSame(ceDeserialized.data, ceDataEncoded)
      // then ensure they are different object (references) ...
      // not needed here because is a string, and payload returns a copy of it, so comparison here will be equals ...

      {
        const serialized = ceFullSerializedStatic
        // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
        t.ok(serialized)
        t.ok(isString(serialized))
        // some checks on serialized instance
        const ceFullDeserializedJSON = JSON.parse(ceFullSerializedStatic) // note that some fields (like dates) will be different when deserialized in this way ...
        // ceFullDeserializedJSON.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
        // console.log(`DEBUG - original cloudEvent: data = '${ceFull.data}', data_base64 = '${ceFull.data_base64}'`)
        // console.log(`DEBUG - deserialized cloudEvent: data = '${ceFullDeserializedJSON.data}', data_base64 = '${ceFullDeserializedJSON.data_base64}'`)
        // next tests are so because here deserialization is done with standard JSON, and not with ce specific method ...
        t.strictNotSame(ceFullDeserializedJSON, ceFull)
        t.strictSame(ceFullDeserializedJSON.data, ceFull.data)
        t.strictSame(ceFullDeserializedJSON.data_base64, ceFull.data_base64)
      }
      {
        // test with not supported data (not a string representation)
        const serialized = ceFullSerializedStatic.replace(ceDataEncoded, '{}')
        // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
        // some checks on serialized instance, but using deserialization methods
        t.throws(function () {
          const ceDeserialized = CloudEvent.deserializeEvent(serialized)
          assert(ceDeserialized === undefined) // never executed
        }, Error, 'Expected exception when creating a CloudEvent with data_base64 set but wrong')
      }
    }

    // the same but with strict mode enabled ...
    {
      const ceFullStrict = ceFactory.createFullBinaryData(ceOptionsStrict)
      t.ok(ceFullStrict)
      t.ok(ceFullStrict.isStrict)
      t.ok(ceIsValid(ceFullStrict, { ...valOptionsNoStrict }))
      t.ok(ceIsValid(ceFullStrict, { ...valOptionsStrict }))
      t.strictSame(ceValidate(ceFullStrict, { ...valOptionsNoStrict }).length, 0)
      t.strictSame(ceValidate(ceFullStrict, { ...valOptionsStrict }).length, 0)
      t.strictSame(CloudEventTransformer.stringFromBase64(ceDataEncoded), ceDataAsString)
      t.strictSame(CloudEventTransformer.stringToBase64(CloudEventTransformer.stringFromBase64(ceDataEncoded)), ceDataEncoded)
      t.strictSame(CloudEventTransformer.stringToBase64(ceDataAsString), ceDataEncoded)
      t.strictSame(CloudEventTransformer.stringFromBase64(CloudEventTransformer.stringToBase64(ceDataAsString)), ceDataAsString)

      const ceFullSerializedStatic = CloudEvent.serializeEvent(ceFullStrict)
      // console.log(`DEBUG - cloudEvent details: ${CloudEventTransformer.dumpObject(ceFullSerializedStatic, 'ceFullSerializedStatic')}`)
      t.ok(ceFullSerializedStatic)
      const ceFullSerialized = ceFullStrict.serialize()
      t.ok(ceFullSerialized)
      t.strictSame(ceFullSerializedStatic, ceFullSerialized)
      // const ceSerialize = CloudEvent.serializeEvent
      t.ok(ceSerialize)
      const ceFullSerializedFunction = ceSerialize(ceFullStrict)
      t.ok(ceFullSerializedFunction)
      t.strictSame(ceFullSerializedFunction, ceFullSerializedStatic)
      t.strictSame(ceFullSerializedFunction, ceFullSerialized)
      const ceFullSerializedOnlyValidFalse = ceSerialize(ceFullStrict, { ...valOnlyValidAllInstance })
      t.ok(ceFullSerializedOnlyValidFalse)
      const ceFullSerializedOnlyValidTrue = ceSerialize(ceFullStrict, { ...valOnlyValidInstance })
      t.ok(ceFullSerializedOnlyValidTrue)

      const ceDeserialized = CloudEvent.deserializeEvent(ceFullSerializedStatic)
      // console.log(`DEBUG - cloudEvent details: ${CloudEventTransformer.dumpObject(ceDeserialized, 'ceDeserialized')}`)
      // console.log(`DEBUG - cloudEvent validation: ${ceDeserialized.validate()}`)
      // console.log(`DEBUG - cloudEvent validation (strict): ${ceDeserialized.validate({ ...valOptionsStrict })}`)
      t.ok(ceDeserialized)
      t.ok(isClass(ceDeserialized, CloudEvent))
      t.ok(ceDeserialized.isValid())
      t.ok(ceDeserialized.validate().length === 0)
      t.ok(ceDeserialized.validate({ ...valOptionsNoStrict }).length === 0)
      t.ok(ceDeserialized.validate({ ...valOptionsStrict }).length === 0)
      t.ok(ceIsValid(ceDeserialized))
      t.ok(ceValidate(ceDeserialized).length === 0)
      t.ok(ceValidate(ceDeserialized, { ...valOptionsNoStrict }).length === 0)
      t.ok(ceValidate(ceDeserialized, { ...valOptionsStrict }).length === 0)
      t.ok(CloudEvent.isCloudEvent(ceDeserialized))

      // inspect content of deserialized CloudEvent, at least on some attributes
      t.ok(ceDeserialized.time)
      const ceDeserializedTimeAsDate = ceDeserialized.timeAsDate
      t.ok(ceDeserializedTimeAsDate)
      t.ok(isDate(ceDeserializedTimeAsDate))
      t.ok(isDateValid(ceDeserializedTimeAsDate))
      t.ok(isDatePast(ceDeserializedTimeAsDate))
      t.strictSame(ceDeserializedTimeAsDate.getTime(), commonEventTime.getTime())
      t.not(ceDeserializedTimeAsDate, commonEventTime)
      t.not(ceDeserialized.time, commonEventTime)
      // console.log(`DEBUG - cloudEvent data: ${CloudEventTransformer.dumpObject(ceDeserialized.data, 'ceDeserialized.data')}`)
      // console.log(`DEBUG - cloudEvent data_base64: ${CloudEventTransformer.dumpObject(ceDeserialized.data_base64, 'ceDeserialized.data_base64')}`)
      // console.log(`DEBUG - cloudEvent payload: ${CloudEventTransformer.dumpObject(ceDeserialized.payload, 'ceDeserialized.payload')}`)
      t.ok(ceDeserialized.data_base64)
      t.ok(isString(ceDeserialized.data_base64))
      t.ok(ceDeserialized.payload)
      t.ok(isString(ceDeserialized.payload))
      // then ensure the value of both are the same ...
      t.strictNotSame(ceDeserialized.payload, ceDeserialized.data)
      t.strictSame(ceDeserialized.payload, CloudEventTransformer.stringFromBase64(ceDeserialized.data_base64))
      // and that they are the same of initial value ...
      t.strictSame(ceDeserialized.data, ceFullStrict.data)
      t.strictNotSame(ceDeserialized.data, ceDataEncoded)
      // then ensure they are different object (references) ...
      // not needed here because is a string, and payload returns a copy of it, so comparison here will be equals ...

      {
        const serialized = ceFullSerializedStatic
        // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
        t.ok(serialized)
        t.ok(isString(serialized))
        // some checks on serialized instance
        const ceFullDeserializedJSON = JSON.parse(ceFullSerializedStatic) // note that some fields (like dates) will be different when deserialized in this way ...
        // ceFullDeserializedJSON.time = commonEventTime // quick fix for the Date/timestamp attribute in the deserialized object
        // console.log(`DEBUG - original cloudEvent: data = '${ceFullStrict.data}', data_base64 = '${ceFullStrict.data_base64}'`)
        // console.log(`DEBUG - deserialized cloudEvent: data = '${ceFullDeserializedJSON.data}', data_base64 = '${ceFullDeserializedJSON.data_base64}'`)
        // next tests are so because here deserialization is done with standard JSON, and not with ce specific method ...
        t.strictNotSame(ceFullDeserializedJSON, ceFullStrict)
        t.strictSame(ceFullDeserializedJSON.data, ceFullStrict.data)
        t.strictSame(ceFullDeserializedJSON.data_base64, ceFullStrict.data_base64)
      }
      {
        // test with not supported data (not a string representation)
        const serialized = ceFullSerializedStatic.replace(ceDataEncoded, '{}')
        // console.log(`DEBUG - serialized cloudEvent details: serialized = '${serialized}'`)
        // some checks on serialized instance, but using deserialization methods
        t.throws(function () {
          const ceDeserialized = CloudEvent.deserializeEvent(serialized)
          assert(ceDeserialized === undefined) // never executed
        }, Error, 'Expected exception when creating a CloudEvent with data_base64 set but wrong')
      }
    }

    t.end()
  })
})

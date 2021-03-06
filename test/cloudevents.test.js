/*
 * Copyright 2018-2021 the original author or authors.
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
  t.teardown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)

    // ensure CloudEvent constructor function exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('CloudEvent'))
    const CloudEvent = fastify.CloudEvent
    // optional, add some assertions with standard Node.js assert statements, as a sample
    assert(CloudEvent !== null)
    assert(typeof CloudEvent === 'function')
    t.ok(CloudEvent)
    t.equal(typeof CloudEvent, 'function')

    // ensure cloudEventSerializeFast function exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('cloudEventSerializeFast'))
    const ceSerializeFast = fastify.cloudEventSerializeFast
    assert(ceSerializeFast !== null)
    assert(typeof ceSerializeFast === 'function')
    t.ok(ceSerializeFast)
    t.equal(typeof ceSerializeFast, 'function')
  })
})

/** @test {CloudEvent} */
test('ensure isValid and validate works good on undefined and null objects', (t) => {
  t.plan(11)
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))
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
    // const ceSerializeFast = fastify.cloudEventSerializeFast
    // t.ok(ceSerializeFast)

    // undefined
    t.notOk()
    t.notOk(ceIsValid())
    t.strictSame(ceValidate(), [new Error('CloudEvent undefined or null')])

    // null
    t.notOk(null)
    t.notOk(ceIsValid(null))
    t.strictSame(ceValidate(null), [new Error('CloudEvent undefined or null')])
  })
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (empty, without minimal arguments set or not set) and ensure they are different objects', (t) => {
  t.plan(12)
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceIsValid = CloudEvent.isValidEvent
    t.ok(ceIsValid)
    const ceValidate = CloudEvent.validateEvent
    t.ok(ceValidate)

    // create an instance without mandatory arguments (but no strict mode): expected success ...
    const ceEmpty = new CloudEvent()
    t.ok(ceEmpty)
    t.ok(!ceIsValid(ceEmpty))
    // t.strictSame(ceValidate(ceEmpty), []) // enable only to see the error during development ...
    t.strictSame(ceValidate(ceEmpty).length, 3) // simplify comparison of results, check only the  number of expected errors ...

    // create an instance without mandatory arguments (but with strict mode): expected failure ...
    let ceEmpty2 = null
    try {
      ceEmpty2 = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true })
      assert(ceEmpty2 === null) // never executed
    } catch (e) {
      t.ok(e) // expected error here
      t.ok(!ceIsValid(ceEmpty2))
      t.strictSame(ceValidate(ceEmpty2), [new Error('CloudEvent undefined or null')])
    }
    t.equal(ceEmpty2, null)
    // the same test, but in a shorter form ...
    t.throws(function () {
      const ce = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true })
      assert(ce === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
  })
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (with minimal fields set) and ensure they are different objects', (t) => {
  t.plan(28)
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceIsValid = CloudEvent.isValidEvent
    t.ok(ceIsValid)
    const ceValidate = CloudEvent.validateEvent
    t.ok(ceValidate)
    // t.notSame(ceIsValid, ceValidate)
    t.strictNotSame(ceIsValid, ceValidate)

    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimal = new CloudEvent('1', // id
      ceNamespace, // type
      '/test', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimal)
    // console.log(`DEBUG - cloudEvent details: ceMinimal = ${JSON.stringify(ceMinimal)}`)
    t.ok(ceIsValid(ceMinimal))
    t.strictSame(ceValidate(ceMinimal), [])
    // t.strictSame(ceValidate(ceEmpty), []) // temp, to see the error during development ...
    t.strictSame(ceValidate(ceMinimal).length, 0) // simplify comparison of results, check only the  number of expected errors ...
    // create another instance, similar
    const ceMinimal2 = new CloudEvent('2', // id
      ceNamespace, // type
      '/test', // source
      {} // data (empty) // optional, but useful the same in this sample usage
    )
    t.ok(ceMinimal2)
    t.ok(ceIsValid(ceMinimal2)) // using default strict mode in the event
    t.ok(ceIsValid(ceMinimal2, { strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(ceValidate(ceMinimal2), [])
    t.strictSame(ceValidate(ceMinimal2).length, 0)
    assert(ceMinimal !== ceMinimal2) // they must be different object references
    // then ensure they are different (have different values inside) ...
    t.notSame(ceMinimal, ceMinimal2)
    t.strictNotSame(ceMinimal, ceMinimal2)

    // create an instance with a mandatory argument undefined (but no strict mode): expected success ...
    // note that undefined arguments will be handled by default arguments, so all will be good the same here ...
    const ceMinimalMandatoryUndefinedNoStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: false })
    assert(ceMinimalMandatoryUndefinedNoStrict !== null)
    t.ok(ceMinimalMandatoryUndefinedNoStrict)
    t.ok(!ceIsValid(ceMinimalMandatoryUndefinedNoStrict)) // using default strict mode in the event
    t.ok(!ceIsValid(ceMinimalMandatoryUndefinedNoStrict, { strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(ceValidate(ceMinimalMandatoryUndefinedNoStrict, { strict: false }).length, 3)
    t.ok(!ceIsValid(ceMinimalMandatoryUndefinedNoStrict, { strict: true })) // the same but validate with strict mode enabled ...

    // the same but with strict mode: expected exception ...
    t.throws(function () {
      const ceMinimalMandatoryUndefinedStrict = new CloudEvent(undefined, undefined, undefined, undefined, { strict: true })
      assert(ceMinimalMandatoryUndefinedStrict === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')

    // create an instance with a mandatory argument null (but no strict mode): expected success ...
    // note that undefined arguments will be handled by default arguments, so all will be good the same here ...
    const ceMinimalMandatoryNullNoStrict = new CloudEvent(null, null, null, null, { strict: false })
    assert(ceMinimalMandatoryNullNoStrict !== null)
    t.ok(ceMinimalMandatoryNullNoStrict)
    t.ok(!ceIsValid(ceMinimalMandatoryNullNoStrict)) // using default strict mode in the event
    t.ok(!ceIsValid(ceMinimalMandatoryNullNoStrict, { strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(ceValidate(ceMinimalMandatoryNullNoStrict, { strict: false }).length, 3)
    t.ok(!ceIsValid(ceMinimalMandatoryNullNoStrict, { strict: true })) // the same but validate with strict mode enabled ...

    // the same but with strict mode: expected exception ...
    t.throws(function () {
      const ceMinimalMandatoryNullStrict = new CloudEvent(null, null, null, null, { strict: true })
      assert(ceMinimalMandatoryNullStrict === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
  })
})

// import some common test data
const {
  // commonEventTime,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonExtensions,
  // ceExtensionStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData,
  ceMapData
} = require('./common-test-data')

/** @test {CloudEvent} */
test('create two CloudEvent instances with all arguments (mandatory and optional arguments) and ensure they are different objects', (t) => {
  t.plan(16)
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceIsValid = CloudEvent.isValidEvent
    t.ok(ceIsValid)
    const ceValidate = CloudEvent.validateEvent
    t.ok(ceValidate)

    // create an instance with an undefined mandatory argument (handled by defaults), but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFull1 = new CloudEvent('1/full',
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      ceCommonOptions
    )
    t.ok(ceFull1)
    t.ok(ceIsValid(ceFull1))
    t.ok(ceIsValid(ceFull1, { strict: false }))
    t.strictSame(ceValidate(ceFull1), [])
    t.strictSame(ceValidate(ceFull1).length, 0)

    // create another instance with all fields equals to the previous: expected success ...
    const ceFull1Clone = new CloudEvent('1/full', // otherwise should be '2/full/no-strict' ...
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      ceCommonOptions
    )
    t.ok(ceFull1Clone)
    t.ok(ceIsValid(ceFull1Clone))
    t.ok(ceIsValid(ceFull1Clone, { strict: false }))
    t.strictSame(ceValidate(ceFull1Clone), [])
    t.strictSame(ceValidate(ceFull1Clone).length, 0)

    // then ensure they are different objects ...
    assert(ceFull1 !== ceFull1Clone) // they must be different object references
    t.same(ceFull1, ceFull1Clone)
    t.strictSame(ceFull1, ceFull1Clone)
  })
})

/** @test {CloudEvent} */
test('create CloudEvent instances with different kind of data attribute, and ensure the validation is right', (t) => {
  t.plan(44)
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceIsValid = CloudEvent.isValidEvent
    t.ok(ceIsValid)
    const ceValidate = CloudEvent.validateEvent
    t.ok(ceValidate)

    // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataUndefined = new CloudEvent('1/full/undefined-data/no-strict',
      ceNamespace,
      ceServerUrl,
      undefined, // data
      ceCommonOptions,
      ceCommonExtensions
    )
    assert(ceFullDataUndefined !== null)
    t.ok(ceFullDataUndefined)
    t.ok(ceIsValid(ceFullDataUndefined))
    t.ok(ceIsValid(ceFullDataUndefined, { strict: false }))
    t.strictSame(ceValidate(ceFullDataUndefined), [])
    t.strictSame(ceValidate(ceFullDataUndefined, { strict: false }).length, 0)
    // the same but with strict mode enabled ...
    const ceFullDataUndefinedStrict = new CloudEvent('1/full/undefined-data/strict',
      ceNamespace,
      ceServerUrl,
      undefined, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    assert(ceFullDataUndefinedStrict !== null)
    t.ok(ceFullDataUndefinedStrict)
    t.ok(ceIsValid(ceFullDataUndefinedStrict))
    t.ok(ceIsValid(ceFullDataUndefinedStrict, { strict: true }))
    t.strictSame(ceValidate(ceFullDataUndefinedStrict), [])
    t.strictSame(ceValidate(ceFullDataUndefinedStrict, { strict: true }).length, 0)

    // create an instance with null data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataNull = new CloudEvent('1/full/null-data/no-strict',
      ceNamespace,
      ceServerUrl,
      null, // data
      ceCommonOptions
    )
    assert(ceFullDataNull !== null)
    t.ok(ceFullDataNull)
    t.ok(ceIsValid(ceFullDataNull))
    t.ok(ceIsValid(ceFullDataNull, { strict: false }))
    t.strictSame(ceValidate(ceFullDataNull), [])
    t.strictSame(ceValidate(ceFullDataNull, { strict: false }).length, 0)
    // the same but with strict mode enabled ...
    const ceFullDataNullStrict = new CloudEvent('1/full/null-data/strict',
      ceNamespace,
      ceServerUrl,
      null, // data
      ceCommonOptionsStrict
    )
    assert(ceFullDataNullStrict !== null)
    t.ok(ceFullDataNullStrict)
    t.ok(ceIsValid(ceFullDataNullStrict))
    t.ok(ceIsValid(ceFullDataNullStrict, { strict: true }))
    t.strictSame(ceValidate(ceFullDataNullStrict), [])
    t.strictSame(ceValidate(ceFullDataNullStrict, { strict: true }).length, 0)

    // create an instance with bad/wrong value of data attribute, but with strict flag disabled: expected success ...
    const ceFullDataString = new CloudEvent('1/full/string-data/no-strict',
      ceNamespace,
      ceServerUrl,
      'data as a string, bad here', // data
      ceCommonOptions
    )
    assert(ceFullDataString !== null)
    t.ok(ceFullDataString)
    // data type errors handled only in strict mode currently ...
    t.ok(ceIsValid(ceFullDataString))
    t.ok(ceIsValid(ceFullDataString, { strict: false }))
    t.strictSame(ceValidate(ceFullDataString), [])
    t.strictSame(ceValidate(ceFullDataString, { strict: false }).length, 0)
    // the same but with strict mode enabled ...
    const ceFullDataStringStrict = new CloudEvent('1/full/string-data/strict',
      ceNamespace,
      ceServerUrl,
      'data as a string, bad here', // data
      ceCommonOptionsStrict
    )
    assert(ceFullDataStringStrict !== null)
    t.ok(ceFullDataStringStrict)
    // data type errors handled only in strict mode currently ...
    t.ok(!ceIsValid(ceFullDataStringStrict))
    t.ok(!ceIsValid(ceFullDataStringStrict, { strict: true }))
    t.strictSame(ceValidate(ceFullDataStringStrict).length, 1)
    t.strictSame(ceValidate(ceFullDataStringStrict, { strict: true }).length, 1)

    // create an instance with a sample Map data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataMap = new CloudEvent('1/full/map-data/no-strict',
      ceNamespace,
      ceServerUrl,
      ceMapData, // data
      ceCommonOptions
    )
    assert(ceFullDataMap !== null)
    t.ok(ceFullDataMap)
    t.ok(ceIsValid(ceFullDataMap))
    t.ok(ceIsValid(ceFullDataMap, { strict: false }))
    t.strictSame(ceValidate(ceFullDataMap), []) // data type errors handled only in strict mode currently ...
    t.strictSame(ceValidate(ceFullDataMap, { strict: false }).length, 0) // data type errors handled only in strict mode currently ...
    // the same but with strict mode enabled ...
    const ceFullDataMapStrict = new CloudEvent('1/full/map-data/strict',
      ceNamespace,
      ceServerUrl,
      ceMapData, // data
      ceCommonOptionsStrict
    )
    assert(ceFullDataMapStrict !== null)
    t.ok(ceFullDataMapStrict)
    t.ok(ceIsValid(ceFullDataMapStrict))
    t.ok(ceIsValid(ceFullDataMapStrict, { strict: true }))
    t.strictSame(ceValidate(ceFullDataMapStrict).length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(ceValidate(ceFullDataMapStrict, { strict: true }).length, 0) // data type errors handled only in strict mode currently ...
  })
})

/** @test {CloudEvent} */
test('create CloudEvent instances with data encoded in base64, and ensure the validation is right', (t) => {
  t.plan(23)

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    t.error(err)
    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceIsValid = CloudEvent.isValidEvent
    t.ok(ceIsValid)
    const ceValidate = CloudEvent.validateEvent
    t.ok(ceValidate)
    const CloudEventTransformer = fastify.CloudEventTransformer
    t.ok(CloudEventTransformer)

    const ceDataAsString = 'Hello World, 2020'
    const ceDataEncoded = 'SGVsbG8gV29ybGQsIDIwMjA='
    const ceOptionsWithDataInBase64 = { ...ceCommonOptions, datainbase64: ceDataEncoded }
    {
      // data_base64 good, and no data defined here (good), expect no validation errors ...
      const ceFull = new CloudEvent('1/full',
        ceNamespace,
        ceServerUrl,
        null,
        ceOptionsWithDataInBase64,
        ceCommonExtensions
      )
      t.ok(ceFull)
      t.ok(ceIsValid(ceFull, { strict: false }))
      t.ok(ceIsValid(ceFull, { strict: true }))
      t.strictSame(ceValidate(ceFull, { strict: false }).length, 0)
      t.strictSame(ceValidate(ceFull, { strict: true }).length, 0)
      t.strictSame(CloudEventTransformer.stringFromBase64(ceDataEncoded), ceDataAsString)
      t.strictSame(CloudEventTransformer.stringFromBase64(CloudEventTransformer.stringToBase64(ceDataAsString)), ceDataAsString)
      t.strictSame(ceFull.payload, CloudEventTransformer.stringFromBase64(ceFull.data_base64))
      t.strictSame(ceFull.dataType, 'Binary')
    }
    // the same but with strict mode ...
    // note that in this case validation will use the strict flag set into ce instance ...
    {
      // data_base64 good, and no data defined here (good), expect no validation errors ...
      const ceFull = new CloudEvent('1/full-strict',
        ceNamespace,
        ceServerUrl,
        null,
        { ...ceOptionsWithDataInBase64, strict: true },
        ceCommonExtensions
      )
      t.ok(ceFull)
      t.ok(ceIsValid(ceFull, { strict: false }))
      t.ok(ceIsValid(ceFull, { strict: true }))
      t.strictSame(ceValidate(ceFull, { strict: false }).length, 0)
      t.strictSame(ceValidate(ceFull, { strict: true }).length, 0)
      t.strictSame(CloudEventTransformer.stringFromBase64(ceDataEncoded), ceDataAsString)
      t.strictSame(CloudEventTransformer.stringFromBase64(CloudEventTransformer.stringToBase64(ceDataAsString)), ceDataAsString)
      t.strictSame(ceFull.payload, CloudEventTransformer.stringFromBase64(ceFull.data_base64))
      t.strictSame(ceFull.dataType, 'Binary')
    }
  })
})

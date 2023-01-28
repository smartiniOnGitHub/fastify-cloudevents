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
// const sget = require('simple-get').concat
const Fastify = require('fastify')

// get factory for instances to test
const ceFactory = require('./common-test-factory')

// import some common test data
// const td = require('./common-test-data')
const {
  // ceCommonData,
  // ceDataAsJSONString,
  ceDataAsString,
  ceDataAsStringEncoded,
  ceNamespace,
  ceOptionsNoStrict,
  ceOptionsStrict,
  // commonEventTime,
  // fixedEventTime,
  // getRandomString,
  // valDebugInfoDisable,
  // valDebugInfoEnable,
  // valExcludeExtensionsDisable,
  // valExcludeExtensionsEnable,
  // valOnlyValidAllInstance,
  // valOnlyValidInstance,
  // valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
} = require('./common-test-data')

/** @test {CloudEvent} */
test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  // t.plan(7)
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err) => {
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

    t.end()
  })
})

/** @test {CloudEvent} */
test('ensure isValid and validate works good on undefined and null objects', (t) => {
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

    t.end()
  })
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (empty, without minimal arguments set or not set) and ensure they are different objects', (t) => {
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

    // create an instance without mandatory arguments (but no strict mode): expected success ...
    const ceEmpty = ceFactory.createEmpty()
    t.ok(ceEmpty)
    t.ok(!ceIsValid(ceEmpty))
    // t.strictSame(ceValidate(ceEmpty), []) // enable only to see the error during development ...
    t.strictSame(ceValidate(ceEmpty).length, 3) // simplify comparison of results, check only the  number of expected errors ...

    // create an instance without mandatory arguments (but with strict mode): expected failure ...
    let ceEmpty2 = null
    try {
      ceEmpty2 = ceFactory.createMinimalMandatoryUndefined(ceOptionsStrict)
      assert(ceEmpty2 === null) // never executed
    } catch (e) {
      t.ok(e) // expected error here
      t.ok(!ceIsValid(ceEmpty2))
      t.strictSame(ceValidate(ceEmpty2), [new Error('CloudEvent undefined or null')])
    }
    t.equal(ceEmpty2, null)
    // the same test, but in a shorter form ...
    t.throws(function () {
      const ce = ceFactory.createMinimalMandatoryUndefined(ceOptionsStrict)
      assert(ce === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')

    t.end()
  })
})

/** @test {CloudEvent} */
test('create some CloudEvent instances (with minimal fields set) and ensure they are different objects', (t) => {
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
    // t.notSame(ceIsValid, ceValidate)
    t.strictNotSame(ceIsValid, ceValidate)

    // create an instance with only mandatory arguments (no strict mode, but doesn't matter in this case): expected success ...
    const ceMinimal = ceFactory.createMinimal()
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
    t.ok(ceIsValid(ceMinimal2, { ...valOptionsNoStrict })) // same of previous but using strict mode in validation options
    t.strictSame(ceValidate(ceMinimal2), [])
    t.strictSame(ceValidate(ceMinimal2).length, 0)
    assert(ceMinimal !== ceMinimal2) // they must be different object references
    // then ensure they are different (have different values inside) ...
    t.notSame(ceMinimal, ceMinimal2)
    t.strictNotSame(ceMinimal, ceMinimal2)

    // create an instance with a mandatory argument undefined (but no strict mode): expected success ...
    // note that undefined arguments will be handled by default arguments, so all will be good the same here ...
    const ceMinimalMandatoryUndefinedNoStrict = ceFactory.createMinimalMandatoryUndefined(ceOptionsNoStrict)
    assert(ceMinimalMandatoryUndefinedNoStrict !== null)
    t.ok(ceMinimalMandatoryUndefinedNoStrict)
    t.ok(!ceMinimalMandatoryUndefinedNoStrict.isStrict)
    t.ok(!ceIsValid(ceMinimalMandatoryUndefinedNoStrict)) // using default strict mode in the event
    t.ok(!ceIsValid(ceMinimalMandatoryUndefinedNoStrict, { ...valOptionsNoStrict })) // same of previous but using strict mode in validation options
    t.strictSame(ceValidate(ceMinimalMandatoryUndefinedNoStrict, { ...valOptionsNoStrict }).length, 3)
    t.ok(!ceIsValid(ceMinimalMandatoryUndefinedNoStrict, { ...valOptionsStrict })) // the same but validate with strict mode enabled ...

    // the same but with strict mode: expected exception ...
    t.throws(function () {
      const ceMinimalMandatoryUndefinedStrict = ceFactory.createMinimalMandatoryUndefined(ceOptionsStrict)
      assert(ceMinimalMandatoryUndefinedStrict === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')

    // create an instance with a mandatory argument null (but no strict mode): expected success ...
    // note that undefined arguments will be handled by default arguments, so all will be good the same here ...
    const ceMinimalMandatoryNullNoStrict = ceFactory.createMinimalMandatoryNull(ceOptionsNoStrict)
    assert(ceMinimalMandatoryNullNoStrict !== null)
    t.ok(ceMinimalMandatoryNullNoStrict)
    t.ok(!ceMinimalMandatoryUndefinedNoStrict.isStrict)
    t.ok(!ceIsValid(ceMinimalMandatoryNullNoStrict)) // using default strict mode in the event
    t.ok(!ceIsValid(ceMinimalMandatoryNullNoStrict, { ...valOptionsNoStrict })) // same of previous but using strict mode in validation options
    t.strictSame(ceValidate(ceMinimalMandatoryNullNoStrict, { ...valOptionsNoStrict }).length, 3)
    t.ok(!ceIsValid(ceMinimalMandatoryNullNoStrict, { ...valOptionsStrict })) // the same but validate with strict mode enabled ...

    // the same but with strict mode: expected exception ...
    t.throws(function () {
      const ceMinimalMandatoryNullStrict = ceFactory.createMinimalMandatoryNull(ceOptionsStrict)
      assert(ceMinimalMandatoryNullStrict === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')

    t.end()
  })
})

/** @test {CloudEvent} */
test('create two CloudEvent instances with all arguments (mandatory and optional arguments) and ensure they are different objects', (t) => {
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

    // create an instance with an undefined mandatory argument (handled by defaults), but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFull1 = ceFactory.createFull()
    t.ok(ceFull1)
    t.ok(!ceFull1.isStrict)
    t.ok(ceIsValid(ceFull1))
    t.ok(ceIsValid(ceFull1, { ...valOptionsNoStrict }))
    t.strictSame(ceValidate(ceFull1), [])
    t.strictSame(ceValidate(ceFull1).length, 0)

    // create another instance with all fields equals to the previous: expected success ...
    const ceFull1Clone = ceFactory.createFull()
    t.ok(ceFull1Clone)
    t.ok(!ceFull1Clone.isStrict)
    t.ok(ceIsValid(ceFull1Clone))
    t.ok(ceIsValid(ceFull1Clone, { ...valOptionsNoStrict }))
    t.strictSame(ceValidate(ceFull1Clone), [])
    t.strictSame(ceValidate(ceFull1Clone).length, 0)

    // then ensure they are different objects ...
    assert(ceFull1 !== ceFull1Clone) // they must be different object references
    t.same(ceFull1, ceFull1Clone)
    t.strictSame(ceFull1, ceFull1Clone)

    t.end()
  })
})

/** @test {CloudEvent} */
test('create CloudEvent instances with different kind of data attribute, and ensure the validation is right', (t) => {
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

    // create an instance with undefined data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataUndefined = ceFactory.createFullUndefinedData()
    assert(ceFullDataUndefined !== null)
    t.ok(ceFullDataUndefined)
    t.ok(!ceFullDataUndefined.isStrict)
    t.ok(ceIsValid(ceFullDataUndefined))
    t.ok(ceIsValid(ceFullDataUndefined, { ...valOptionsNoStrict }))
    t.strictSame(ceValidate(ceFullDataUndefined), [])
    t.strictSame(ceValidate(ceFullDataUndefined, { ...valOptionsNoStrict }).length, 0)
    // the same but with strict mode enabled ...
    const ceFullDataUndefinedStrict = ceFactory.createFullUndefinedData(ceOptionsStrict)
    assert(ceFullDataUndefinedStrict !== null)
    // console.log(`DEBUG | cloudEvent details: ${JSON.stringify(ceFullDataUndefinedStrict)}`)
    // console.log(`DEBUG | cloudEvent details: ${T.dumpObject(ceFullDataUndefinedStrict, 'ceFullDataUndefinedStrict')}`)
    // console.log(`DEBUG | cloudEvent details: ${ceFullDataUndefinedStrict}`) // implicit call of its toString method ...
    t.ok(ceFullDataUndefinedStrict)
    t.ok(ceFullDataUndefinedStrict.isStrict)
    t.ok(ceIsValid(ceFullDataUndefinedStrict))
    t.ok(ceIsValid(ceFullDataUndefinedStrict, { ...valOptionsStrict }))
    t.strictSame(ceValidate(ceFullDataUndefinedStrict), [])
    t.strictSame(ceValidate(ceFullDataUndefinedStrict, { ...valOptionsStrict }).length, 0)

    // create an instance with null data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataNull = ceFactory.createFullNullData(ceOptionsNoStrict)
    assert(ceFullDataNull !== null)
    // console.log(`DEBUG | cloudEvent details: ${JSON.stringify(ceFullDataNull)}`)
    t.ok(ceFullDataNull)
    t.ok(!ceFullDataNull.isStrict)
    t.ok(ceIsValid(ceFullDataNull))
    t.ok(ceIsValid(ceFullDataNull, { ...valOptionsNoStrict }))
    t.strictSame(ceValidate(ceFullDataNull), [])
    t.strictSame(ceValidate(ceFullDataNull, { ...valOptionsNoStrict }).length, 0)
    // the same but with strict mode enabled ...
    const ceFullDataNullStrict = ceFactory.createFullNullData(ceOptionsStrict)
    assert(ceFullDataNullStrict !== null)
    t.ok(ceFullDataNullStrict)
    t.ok(ceFullDataNullStrict.isStrict)
    t.ok(ceIsValid(ceFullDataNullStrict))
    t.ok(ceIsValid(ceFullDataNullStrict, { ...valOptionsStrict }))
    t.strictSame(ceValidate(ceFullDataNullStrict), [])
    t.strictSame(ceValidate(ceFullDataNullStrict, { ...valOptionsStrict }).length, 0)

    // create an instance with bad/wrong value of data attribute, but with strict flag disabled: expected success ...
    const ceFullDataString = ceFactory.createFullTextDataBadContentType(ceOptionsNoStrict)
    assert(ceFullDataString !== null)
    t.ok(ceFullDataString)
    t.ok(!ceFullDataString.isStrict)
    // data type errors handled only in strict mode currently ...
    t.ok(ceIsValid(ceFullDataString))
    t.ok(ceIsValid(ceFullDataString, { ...valOptionsNoStrict }))
    t.strictSame(ceValidate(ceFullDataString), [])
    t.strictSame(ceValidate(ceFullDataString, { ...valOptionsNoStrict }).length, 0)
    // the same but with strict mode enabled ...
    const ceFullDataStringStrict = ceFactory.createFullTextDataBadContentType(ceOptionsStrict)
    assert(ceFullDataStringStrict !== null)
    t.ok(ceFullDataStringStrict)
    t.ok(ceFullDataStringStrict.isStrict)
    // data type errors handled only in strict mode currently ...
    t.ok(!ceIsValid(ceFullDataStringStrict))
    t.ok(!ceIsValid(ceFullDataStringStrict, { ...valOptionsStrict }))
    t.strictSame(ceValidate(ceFullDataStringStrict).length, 1)
    t.strictSame(ceValidate(ceFullDataStringStrict, { ...valOptionsStrict }).length, 1)

    // create an instance with a sample Map data attribute, but with strict flag disabled: expected success ...
    // note that null values are not handled by default values, only undefined values ...
    const ceFullDataMap = ceFactory.createFullMapData()
    assert(ceFullDataMap !== null)
    t.ok(ceFullDataMap)
    t.ok(!ceFullDataMap.isStrict)
    t.ok(ceIsValid(ceFullDataMap))
    t.ok(ceIsValid(ceFullDataMap, { ...valOptionsNoStrict }))
    t.strictSame(ceValidate(ceFullDataMap), []) // data type errors handled only in strict mode currently ...
    t.strictSame(ceValidate(ceFullDataMap, { ...valOptionsNoStrict }).length, 0) // data type errors handled only in strict mode currently ...
    // the same but with strict mode enabled ...
    const ceFullDataMapStrict = ceFactory.createFullMapData(ceOptionsStrict)
    assert(ceFullDataMapStrict !== null)
    t.ok(ceFullDataMapStrict)
    t.ok(ceFullDataMapStrict.isStrict)
    t.ok(ceIsValid(ceFullDataMapStrict))
    t.ok(ceIsValid(ceFullDataMapStrict, { ...valOptionsStrict }))
    t.strictSame(ceValidate(ceFullDataMapStrict).length, 0) // data type errors handled only in strict mode currently ...
    t.strictSame(ceValidate(ceFullDataMapStrict, { ...valOptionsStrict }).length, 0) // data type errors handled only in strict mode currently ...

    t.end()
  })
})

/** @test {CloudEvent} */
test('create CloudEvent instances with data encoded in base64, and ensure the validation is right', (t) => {
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
    const CloudEventTransformer = fastify.CloudEventTransformer
    t.ok(CloudEventTransformer)

    const ceDataEncoded = ceDataAsStringEncoded
    {
      // data_base64 good, and no data defined here (good), expect no validation errors ...
      const ceFull = ceFactory.createFullBinaryData()
      t.ok(ceFull)
      t.ok(!ceFull.isStrict)
      t.ok(ceIsValid(ceFull, { ...valOptionsNoStrict }))
      t.ok(ceIsValid(ceFull, { ...valOptionsStrict }))
      t.strictSame(ceValidate(ceFull, { ...valOptionsNoStrict }).length, 0)
      t.strictSame(ceValidate(ceFull, { ...valOptionsStrict }).length, 0)
      t.strictSame(CloudEventTransformer.stringFromBase64(ceDataEncoded), ceDataAsString)
      t.strictSame(CloudEventTransformer.stringFromBase64(CloudEventTransformer.stringToBase64(ceDataAsString)), ceDataAsString)
      t.strictSame(ceFull.payload, CloudEventTransformer.stringFromBase64(ceFull.data_base64))
      t.strictSame(ceFull.dataType, 'Binary')
    }
    // the same but with strict mode ...
    // note that in this case validation will use the strict flag set into ce instance ...
    {
      // data_base64 good, and no data defined here (good), expect no validation errors ...
      const ceFull = ceFactory.createFullBinaryData(ceOptionsStrict)
      t.ok(ceFull)
      t.ok(ceFull.isStrict)
      t.ok(ceIsValid(ceFull, { ...valOptionsNoStrict }))
      t.ok(ceIsValid(ceFull, { ...valOptionsStrict }))
      t.strictSame(ceValidate(ceFull, { ...valOptionsNoStrict }).length, 0)
      t.strictSame(ceValidate(ceFull, { ...valOptionsStrict }).length, 0)
      t.strictSame(CloudEventTransformer.stringFromBase64(ceDataEncoded), ceDataAsString)
      t.strictSame(CloudEventTransformer.stringFromBase64(CloudEventTransformer.stringToBase64(ceDataAsString)), ceDataAsString)
      t.strictSame(ceFull.payload, CloudEventTransformer.stringFromBase64(ceFull.data_base64))
      t.strictSame(ceFull.dataType, 'Binary')
    }

    t.end()
  })
})

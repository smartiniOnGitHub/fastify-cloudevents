/*
 * Copyright 2018-2026 the original author or authors.
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

// use 'ajv' (dependency of fast-json-stringify') in all tests here
const Ajv = require('ajv')
const addFormats = require('ajv-formats') // already installed when installing Ajv itself

// get factory for instances to test
const ceFactory = require('./common-test-factory')

// import some common test data
// const td = require('./common-test-data')
const {
  // commonEventTime,
  ceOptionsNoStrict,
  ceOptionsStrict,
  valDebugInfoDisable,
  valDebugInfoEnable,
  valOnlyValidAllInstance,
  valOnlyValidInstance
} = require('./common-test-data')

function ceValidateAlwaysFail (schema) {
  return {
    valid: false, // always fail
    errors: [] // but provide no details (the same from ajv will set null here)
  }
}

/** @test {fastifyCloudEvents} */
test('ensure normal instancing of fast validation (like the one exposed by the plugin) is good', (t) => {
  // t.plan(30)
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)
    t.equal(typeof ceSerializeFast, 'function')

    const ceSchema = fastify.cloudEventJSONSchema
    t.ok(ceSchema)
    t.equal(typeof ceSchema, 'object')

    // instancing schema compiler in the same way of the plugin,
    // but in a manual way here, as a sample
    const ajv = new Ajv({ coerceTypes: true, removeAdditional: true }) // use same defaults used in plugin code
    assert(ajv !== null)
    t.ok(ajv)
    addFormats(ajv) // enhance ajv validation on some formats
    const ceValidate = ajv.compile(ceSchema)
    assert(ceValidate !== null)
    t.ok(ceValidate)
    t.equal(typeof ceValidate, 'function')

    // test on some good data
    const ceFullStrict = ceFactory.createFull(ceOptionsStrict)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isValid())
    t.ok(ceFullStrict.isStrict)

    // additional tests, with bad objects ...
    const ceFullBad = ceFactory.createFullBadIdAndExtension()
    t.ok(ceFullBad)
    t.ok(!ceFullBad.isValid())
    t.ok(!ceFullBad.isStrict)

    {
      // tests using the good validator
      // serialization and validation tests on the good test object
      // console.log(`DEBUG - dump validation errors: ${CloudEvent.dumpValidationResults(ceFullStrict, {}, 'ceFullStrict')}`)
      const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict, { ...valOnlyValidInstance })
      t.ok(ceFullStrictSerializedFast)
      const ceFullStrictValid = ceValidate(ceFullStrict)
      // console.log(`DEBUG - ceFullStrict, validation ajv: ${ceFullStrictValid}`)
      // if (!ceFullStrictValid) {
      //   console.log(`DEBUG - cloudEvent details: ${JSON.stringify(ceFullStrict)}`)
      //   console.log(`DEBUG - ceFullStrict, dump validation errors with ajv: ${JSON.stringify(ceValidate.errors)}`)
      // }
      t.ok(ceFullStrictValid)

      // serialization and validation tests on the bad test object
      // console.log(`DEBUG - dump validation errors: ${CloudEvent.dumpValidationResults(ceFullBad, {}, 'ceFullBad')}`)
      const ceFullBadSerializedOnlyValidFalse = ceSerializeFast(ceFullBad, { ...valOnlyValidAllInstance })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      const ceFullBadValid = ceValidate(ceFullBad)
      // console.log(`DEBUG - ceFullBad, validation ajv: ${ceFullBad}`)
      // if (!ceFullBadValid) console.log(`DEBUG - ceFullBad, dump validation errors with ajv: ${JSON.stringify(ceValidate.errors)}`)
      t.ok(!ceFullBadValid)
    }

    {
      // tests using the bad validator
      // serialization and validation tests on the good test object
      const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict, { ...valOnlyValidInstance })
      t.ok(ceFullStrictSerializedFast)
      const ceFullStrictValidated = ceValidateAlwaysFail(ceFullStrict)
      // console.log(`DEBUG - ceFullStrict, validation by always fail validator: ${JSON.stringify(ceFullStrictValidated)}`)
      t.ok(!ceFullStrictValidated.valid)

      // serialization and validation tests on the bad test object
      const ceFullBadSerializedOnlyValidFalse = ceSerializeFast(ceFullBad, { ...valOnlyValidAllInstance })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      const ceFullBadValidated = ceValidateAlwaysFail(ceFullBad)
      // console.log(`DEBUG - ceFullBad, validation by always fail validator: ${JSON.stringify(ceFullBadValidated)}`)
      t.ok(!ceFullBadValidated.valid)
    }

    {
      // use directly the event with strict mode enabled ...
      const ceStrict = ceFactory.createFullTextData(ceOptionsStrict)
      assert(ceStrict !== null)
      t.ok(ceStrict)
      t.ok(ceStrict.isStrict)
      t.ok(CloudEvent.isValidEvent(ceStrict))
      t.strictSame(ceStrict.payload, ceStrict.data)
      t.strictSame(ceStrict.dataType, 'Text')
      const ceStrictSerializedFast = ceSerializeFast(ceStrict, { ...valOnlyValidInstance })
      t.ok(ceStrictSerializedFast)
      const ceStrictValid = ceValidate(ceFullStrict)
      // console.log(`DEBUG - ceStrict, validation ajv: ${ceStrictValid}`)
      // if (!ceStrictValid) {
      //   console.log(`DEBUG - cloudEvent details: ${JSON.stringify(ceStrict)}`)
      //   console.log(`DEBUG - ceStrict, dump validation errors with ajv: ${JSON.stringify(ceValidate.errors)}`)
      // }
      t.ok(ceStrictValid)
      // console.log(`DEBUG - ceStrict serialized:\n${ceStrictSerializedFast}`)
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

/** @test {fastifyCloudEvents} */
test('ensure CloudEvent schema and schema compiler (both exposed by the plugin) pass validation', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)
    t.equal(typeof ceSerializeFast, 'function')

    const ceSchema = fastify.cloudEventJSONSchema
    t.ok(ceSchema)
    t.equal(typeof ceSchema, 'object')

    const ceValidateFast = fastify.cloudEventValidateFast
    t.ok(ceValidateFast)
    t.equal(typeof ceValidateFast, 'function')

    // test on some good data
    const ceFullStrict = ceFactory.createFull(ceOptionsStrict)
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isStrict)
    t.ok(ceFullStrict.isValid())

    // additional tests, with bad objects ...
    const ceFullBad = ceFactory.createFullBadIdAndExtension(ceOptionsNoStrict)
    t.ok(ceFullBad)
    t.ok(!ceFullBad.isStrict)
    t.ok(!ceFullBad.isValid())

    {
      // tests using the good validator
      // serialization and validation tests on the good test object
      // console.log(`DEBUG - dump standard validation errors: ${CloudEvent.dumpValidationResults(ceFullStrict, {}, 'ceFullStrict')}`)
      const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict, { ...valOnlyValidInstance, ...valDebugInfoDisable })
      t.ok(ceFullStrictSerializedFast)
      const ceFullStrictValidated = ceValidateFast(ceFullStrict)
      // console.log(`DEBUG - ceFullStrict, validation by ajv: ${JSON.stringify(ceFullStrictValidated)}`)
      t.ok(ceFullStrictValidated.valid)

      // serialization and validation tests on the bad test object
      // console.log(`DEBUG - dump standard validation errors: ${CloudEvent.dumpValidationResults(ceFullBad, {}, 'ceFullBad')}`)
      const ceFullBadSerializedOnlyValidFalse = ceSerializeFast(ceFullBad, { ...valOnlyValidAllInstance, ...valDebugInfoDisable })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      const ceFullBadValidated = ceValidateFast(ceFullBad)
      // console.log(`DEBUG - ceFullBad, validation by ajv: ${JSON.stringify(ceFullBadValidated)}`)
      t.ok(!ceFullBadValidated.valid)
    }

    {
      // use directly the event with strict mode enabled ...
      const ceStrict = ceFactory.createFullTextData(ceOptionsStrict)
      assert(ceStrict !== null)
      t.ok(ceStrict)
      t.ok(ceStrict.isStrict)
      t.ok(CloudEvent.isValidEvent(ceStrict))
      t.strictSame(ceStrict.payload, ceStrict.data)
      t.strictSame(ceStrict.dataType, 'Text')
      const ceStrictSerializedFast = ceSerializeFast(ceStrict, { ...valOnlyValidInstance, ...valDebugInfoEnable })
      t.ok(ceStrictSerializedFast)
      const ceStrictValidated = ceValidateFast(ceStrict)
      // console.log(`DEBUG - ceStrict, validation by ajv: ${JSON.stringify(ceStrictValidated)}`)
      t.ok(ceStrictValidated)
      t.ok(ceStrictValidated.valid)
      // console.log(`DEBUG - ceStrict serialized:\n${ceStrictSerializedFast}`)
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

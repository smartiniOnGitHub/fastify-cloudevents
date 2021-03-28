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

// use 'ajv' (dependency of fast-json-stringify') in all tests here
const Ajv = require('ajv')

// import some common test data
const {
  // commonEventTime,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonExtensions,
  // ceExtensionStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData
  // ceMapData
} = require('./common-test-data')

/** @test {fastifyCloudEvents} */
test('ensure CloudEvent schema (exposed by the plugin) pass validation with a schema compiler', (t) => {
  t.plan(20)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(require('../src/plugin')) // configure this plugin with its default options

  fastify.listen(0, (err, address) => {
    t.error(err)

    const CloudEvent = fastify.CloudEvent
    t.ok(CloudEvent)
    const ceSerializeFast = fastify.cloudEventSerializeFast
    t.ok(ceSerializeFast)

    const ceSchema = fastify.cloudEventJSONSchema
    t.ok(ceSchema)
    t.strictEqual(typeof ceSchema, 'object')

    const ajv = new Ajv({ coerceTypes: true, removeAdditional: true })
    assert(ajv !== null)
    t.ok(ajv)
    const ceValidate = ajv.compile(ceSchema)
    assert(ceValidate !== null)
    assert(typeof ceValidate === 'function')
    t.ok(ceValidate)
    const ceValidateAlwaysFail = function (schema) {
      return false // always fail
    }
    t.ok(ceValidateAlwaysFail)

    // test on some good data
    const ceFullStrict = new CloudEvent('1/full/sample-data/strict',
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      ceCommonOptionsStrict,
      ceCommonExtensions
    )
    t.ok(ceFullStrict)
    t.ok(ceFullStrict.isValid())

    // additional tests, with bad objects ...
    const ceFullBad = new CloudEvent(null,
      ceNamespace,
      ceServerUrl,
      ceCommonData, // data
      ceCommonOptions,
      {} // extensions
    )
    t.ok(ceFullBad)
    t.ok(!ceFullBad.isValid())

    {
      // tests using the good validator
      // serialization and validation tests on the good test object
      // console.log(`DEBUG - dump validation errors: ${CloudEvent.dumpValidationResults(ceFullStrict, {}, 'ceFullStrict')}`)
      const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict, { onlyValid: true })
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
      const ceFullBadSerializedOnlyValidFalse = ceSerializeFast(ceFullBad, { onlyValid: false })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      const ceFullBadValid = ceValidate(ceFullBad)
      // console.log(`DEBUG - ceFullBad, validation ajv: ${ceFullBad}`)
      // if (!ceFullBadValid) console.log(`DEBUG - ceFullBad, dump validation errors with ajv: ${JSON.stringify(ceValidate.errors)}`)
      t.ok(!ceFullBadValid)
    }

    {
      // tests using the bad validator
      // serialization and validation tests on the good test object
      const ceFullStrictSerializedFast = ceSerializeFast(ceFullStrict, { onlyValid: true })
      t.ok(ceFullStrictSerializedFast)
      const ceFullStrictValid = ceValidateAlwaysFail(ceFullStrict)
      // if (!ceFullStrictValid) console.log(`DEBUG: validation errors: ${JSON.stringify(ceValidateAlwaysFail.errors)}`)
      t.ok(!ceFullStrictValid)

      // serialization and validation tests on the bad test object
      const ceFullBadSerializedOnlyValidFalse = ceSerializeFast(ceFullBad, { onlyValid: false })
      t.ok(ceFullBadSerializedOnlyValidFalse)
      const ceFullBadValid = ceValidateAlwaysFail(ceFullBad)
      // if (!ceFullBadValid) console.log(`DEBUG: validation errors: ${JSON.stringify(ceValidateAlwaysFail.errors)}`)
      t.ok(!ceFullBadValid)
    }
  })
})

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

test('ensure decorator functions (exposed by the plugin) exists', (t) => {
  t.plan(10)
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

    // ensure isCloudEventValid function exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('isCloudEventValid'))
    const ceIsValid = fastify.isCloudEventValid
    assert(ceIsValid !== null)
    assert(typeof ceIsValid === 'function')
    t.ok(ceIsValid)
    t.strictEqual(typeof ceIsValid, 'function')

    // ensure cloudEventValidation function exist in Fastify decorators ...
    t.ok(fastify.hasDecorator('cloudEventValidation'))
    const ceValidate = fastify.cloudEventValidation
    assert(ceValidate !== null)
    assert(typeof ceValidate === 'function')
    t.ok(ceValidate)
    t.strictEqual(typeof ceValidate, 'function')
  })
})

test('ensure isValid and validate works good on undefined and null objects', (t) => {
  t.plan(10)
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

    // undefined
    t.notOk()
    t.notOk(ceIsValid())
    t.strictSame(ceValidate(), [ new Error('CloudEvent undefined or null') ])

    // null
    t.notOk(null)
    t.notOk(ceIsValid(null))
    t.strictSame(ceValidate(null), [ new Error('CloudEvent undefined or null') ])
  })
})

test('create some CloudEvent instances (empty, without minimal arguments set or not set) and ensure they are different objects', (t) => {
  t.plan(12)
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

    // create an instance without mandatory arguments (but no strict mode): expected success ...
    const ceEmpty = new CECreator()
    t.ok(ceEmpty)
    t.ok(ceIsValid(ceEmpty))
    // t.strictSame(ceValidate(ceEmpty), []) // temp, to see the error during development ...
    t.strictSame(ceValidate(ceEmpty).length, 2) // simplify comparison of results, check only the  number of expected errors ...

    // create an instance without mandatory arguments (but with strict mode): expected failure ...
    let ceEmpty2 = null
    try {
      ceEmpty2 = new CECreator(undefined, undefined, undefined, { strict: true })
    } catch (e) {
      t.ok(e) // expected error here
      t.ok(!ceIsValid(ceEmpty2))
      t.strictSame(ceValidate(ceEmpty2), [ new Error('CloudEvent undefined or null') ])
    }
    t.equal(ceEmpty2, null)
    // the same test, but in a shorter form ...
    t.throws(function () {
      const ce = new CECreator(undefined, undefined, undefined, { strict: true })
      assert(ce === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
  })
})

test('create some CloudEvent instances (with minimal fields set) and ensure they are different objects', (t) => {
  t.plan(20)
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
    t.notSame(ceIsValid, ceValidate)
    t.strictNotSame(ceIsValid, ceValidate)

    // create an instance with only mandatory arguments (but no strict mode): expected success ...
    const ceMinimal = new CECreator('1', // eventID
      'org.fastify.plugins.cloudevents.testevent', // eventType
      {} // data (empty)
    )
    t.ok(ceMinimal)
    t.ok(ceIsValid(ceMinimal))
    t.strictSame(ceValidate(ceMinimal), []) // TODO: fix test ... wip
    // create another instance, similar
    const ceMinimal2 = new CECreator('2', // eventID
      'org.fastify.plugins.cloudevents.testevent', // eventType
      {} // data (empty)
    )
    t.ok(ceMinimal2)
    t.ok(ceIsValid(ceMinimal2)) // using strict mode in the event
    t.ok(ceIsValid(ceMinimal2, { strict: false })) // same of previous but using strict mode in validation options
    t.strictSame(ceValidate(ceMinimal2), []) // TODO: fix test ... wip
    assert(ceMinimal !== ceMinimal2) // they must be different object references
    // then ensure they are different (have different values inside) ...
    t.notSame(ceMinimal, ceMinimal2)
    t.strictNotSame(ceMinimal, ceMinimal2)

    // create an instance without a mandatory argument (but with strict mode): expected failure ...
    t.throws(function () {
      const ceMinimalStrictBad = new CECreator('1.strict.bad', // eventID
        'org.fastify.plugins.cloudevents.testevent', // eventType
        undefined, // data
        { strict: true }
      )
      assert(ceMinimalStrictBad === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')

    // create an instance with a mandatory argument handled by defaults (undefined, not null), (but with strict mode) expected success ...
    const ceMinimalStrictGood = new CECreator('1.strict.good', // eventID
      'org.fastify.plugins.cloudevents.testevent', // eventType
      undefined, // data
      { strict: true }
    )
    t.ok(ceMinimalStrictGood)
    t.ok(ceIsValid(ceMinimalStrictGood)) // using strict mode in the event
    t.ok(ceIsValid(ceMinimalStrictGood, { strict: true })) // same of previous but using strict mode in validation options
    t.strictSame(ceValidate(ceMinimalStrictGood), []) // TODO: fix test ... wip
  })
})

test('create two CloudEvent instances with all arguments (mandatory and optional arguments) and ensure they are different objects', (t) => {
  t.plan(14)
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

    // create some common options
    const ceCommonOptions = {
      cloudEventsVersion: '0.0.0',
      eventTypeVersion: '1.0.0',
      source: '/test',
      eventTime: new Date(),
      extensions: {},
      contentType: 'application/json',
      schemaURL: 'http://my-schema.localhost.localdomain',
      strict: false
    }
    // some common data
    const ceCommonData = { 'hello': 'world' }
    // create an instance with a null mandatory argument (handled by defaults), but with check flag enabled: expected success ...
    const ceFull1 = new CECreator('1/full',
      'org.fastify.plugins.cloudevents.testevent',
      ceCommonData,
      ceCommonOptions
    )
    t.ok(ceFull1)
    t.ok(ceIsValid(ceFull1))
    t.ok(ceIsValid(ceFull1, { strict: false }))
    t.strictSame(ceValidate(ceFull1), []) // TODO: fix test ... wip

    // create another instance with all fields equals: expected success ...
    const ceFull1Clone = new CECreator('1/full', // should be '2/full/no-strict' ...
      'org.fastify.plugins.cloudevents.testevent',
      ceCommonData,
      ceCommonOptions
    )
    t.ok(ceFull1Clone)
    t.ok(ceIsValid(ceFull1Clone))
    t.ok(ceIsValid(ceFull1Clone, { strict: false }))
    t.strictSame(ceValidate(ceFull1Clone), []) // TODO: fix test ... wip

    // then ensure they are different objects ...
    assert(ceFull1 !== ceFull1Clone) // they must be different object references
    t.same(ceFull1, ceFull1Clone)
    t.strictSame(ceFull1, ceFull1Clone)
  })
})

// TODO: add more tests ...

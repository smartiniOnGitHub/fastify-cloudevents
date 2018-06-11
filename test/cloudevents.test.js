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
  t.plan(4)
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

    // TODO: ensure other decorator functions exists ... wip
  })
})

test('create some CloudEvent instances (empty, without minimal arguments set or not set) and ensure they are different objects', (t) => {
  t.plan(6)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const CECreator = fastify.CloudEventCreate
    t.ok(CECreator)

    // create an instance without mandatory arguments (but no strict mode): expected success ...
    const ceEmpty = new CECreator()
    // console.log(`DEBUG - ceEmpty = ${ceEmpty}, with type '${typeof ceEmpty}'`) // temp ...
    t.ok(ceEmpty)

    // create an instance without mandatory arguments (but with strict mode): expected failure ...
    let ceEmpty2 = null
    try {
      ceEmpty2 = new CECreator(undefined, undefined, undefined, { strict: true })
    } catch (e) {
      t.ok(e) // expected error here
      // console.log(`DEBUG - e = ${e}, with message '${e.message}'`) // temp ...
    }
    // console.log(`DEBUG - ceEmpty2 = ${ceEmpty2}, with type '${typeof ceEmpty2}'`) // temp ...
    t.equal(ceEmpty2, null)
    // the same test, but in a shorter form ...
    t.throws(function () {
      const ce = new CECreator(undefined, undefined, undefined, { strict: true })
      assert(ce === null) // never executed
    }, Error, 'Expected exception when creating a CloudEvent without mandatory arguments with strict flag enabled')
  })
})

test('create some CloudEvent instances (with minimal fields set) and ensure they are different objects', (t) => {
  t.plan(7)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const CECreator = fastify.CloudEventCreate
    t.ok(CECreator)

    // create an instance with only mandatory arguments (but no strict mode): expected success ...
    const ceMinimal = new CECreator('1', // eventID
      'org.fastify.plugins.cloudevents.testevent', // eventType
      {} // data (empty)
    )
    // console.log(`DEBUG - ceMinimal = ${ceMinimal}, with type '${typeof ceMinimal}'`) // temp ...
    t.ok(ceMinimal)
    // create another instance, similar
    const ceMinimal2 = new CECreator('2', // eventID
      'org.fastify.plugins.cloudevents.testevent', // eventType
      {} // data (empty)
    )
    t.ok(ceMinimal2)
    // then ensure they are different objects ...
    t.notSame(ceMinimal, ceMinimal2)

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
  })
})

test('create two CloudEvent instances with all arguments (mandatory and optional arguments) and ensure they are different objects', (t) => {
  t.plan(3)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const CECreator = fastify.CloudEventCreate
    t.ok(CECreator)

    // create an instance with a null mandatory argument (handled by defaults), but with check flag enabled: expected success ...
    const ceFull1 = new CECreator('1.strict', // eventID
      'org.fastify.plugins.cloudevents.testevent', // eventType
      { 'hello': 'world' }, // data
      { cloudEventsVersion: '0.0.0',
        eventTypeVersion: '1.0.0',
        source: '/test',
        eventTime: new Date(),
        extensions: {},
        contentType: 'application/json',
        schemaURL: '',
        strict: false
      }
    )
    t.ok(ceFull1)
  })
})

// TODO: add more tests ...

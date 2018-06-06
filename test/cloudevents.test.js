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

test('create two CloudEvent instances (one minimal and one with all fields) and ensure they are different objects', (t) => {
  t.plan(6)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const CECreator = fastify.CloudEventCreate
    t.ok(CECreator)

    // create an instance without mandatory arguments, expected failure ...
    let ceEmpty = null
    try {
      ceEmpty = new CECreator()
    } catch (e) {
      // TODO: expected TypeError ...
      console.log(`DEBUG - e = ${e}`) // temp ...
    }
    // const ceEmpty = new CECreator()
    // console.log(`DEBUG - ceEmpty = ${ceEmpty}`) // temp ...
    t.notOk(ceEmpty)

    // create an instance with only mandatory arguments (no optional arguments), expected success ...
    const ceMinimal = new CECreator(null,
      'org.fastify.plugins.cloudevents.testevent', null,
      '/',
      '1', null,
      null,
      null, null, null
    )
    console.log(`DEBUG - ceMinimal = ${ceMinimal}, with type '${typeof ceMinimal}'`) // temp ...
    t.ok(ceMinimal)
    // create another instance
    const ceMinimal2 = new CECreator(null,
      'org.fastify.plugins.cloudevents.testevent', null,
      '/',
      '2', null,
      null,
      null, null, null
    )
    t.ok(ceMinimal2)
    t.notSame(ceMinimal, ceMinimal2)
    // then ensure they are different objects ...

    // create an instance with all arguments (mandatory and optional arguments), expected success ...
    // TODO: use as test data ... wip
    //   "eventType" : "com.example.someevent",
    //     "eventTypeVersion" : "1.0",
    //       "source" : "/mycontext",
    //         "eventID" : "A234-1234-1234",
    //           "eventTime" : "2018-04-05T17:31:00Z",
    //             "extensions" : {
    //   "comExampleExtension" : "value"
    // },
    // "contentType" : "text/xml",
    //   "data"

    // temp ...

    // TODO: create other objects and check results ... wip
  })
})

// TODO: create CloudEvent instances not valid and ensure errors will be triggered ...

// TODO: add more tests ...

/*
// TODO: cleanup ...
test('default webhook (and empty body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    sget({
      method: 'POST',
      timeout: 2000,
      url: `http://localhost:${port}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})
 */

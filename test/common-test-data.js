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

/**
 * Common-Test-Data:
 * Utility module to export some test data.
 */

/** create some common options, for better reuse in tests */
const commonEventTime = new Date()
const ceCommonOptions = {
  time: commonEventTime,
  extensions: { 'exampleExtension': 'value' },
  contenttype: 'application/json',
  schemaurl: 'http://my-schema.localhost.localdomain',
  strict: false
}
/** create some common options with strict flag enabled, for better reuse in tests */
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
/** create a sample namespace for events here, for better reuse in tests */
const ceNamespace = 'com.github.smartiniOnGitHub.fastify-cloudevents.testevent'
/** create a sample common server URL, for better reuse in tests */
const ceServerUrl = '/test'
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { 'hello': 'world', 'year': 2019 }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map(['key-1', 'value 1'], ['key-2', 'value 2'])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

module.exports = {
  commonEventTime,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData,
  ceMapData
}

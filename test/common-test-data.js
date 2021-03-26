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

/**
 * Common-Test-Data:
 * Utility module to export some test data.
 */

/** create some common options, for better reuse in tests */
const commonEventTime = new Date()
const ceCommonOptions = {
  time: commonEventTime,
  datacontenttype: 'application/json',
  dataschema: 'http://my-schema.localhost.localdomain',
  subject: 'subject',
  strict: false
}
/** create some common options with strict flag enabled, for better reuse in tests */
const ceCommonOptionsStrict = { ...ceCommonOptions, strict: true }
/** create some common extensions, for better reuse in tests */
const ceCommonExtensions = { exampleextension: 'value' }
/** create a common extension only for the strict mode, for better reuse in tests */
const ceExtensionStrict = { strictvalidation: true }
/** create a sample namespace for events here, for better reuse in tests */
const ceNamespace = 'com.github.smartiniOnGitHub.fastify-cloudevents.testevent'
/** create a sample common server URL, for better reuse in tests */
const ceServerUrl = '/test'
/** create some common data from an object, for better reuse in tests */
const ceCommonData = { hello: 'world', year: 2020 }
/** create some common data from a Map, for better reuse in tests */
const ceMapData = new Map() // empty Map
// const ceMapData = new Map(['key-1', 'value 1'], ['key-2', 'value 2'])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

module.exports = {
  commonEventTime,
  ceCommonOptions,
  ceCommonOptionsStrict,
  ceCommonExtensions,
  ceExtensionStrict,
  ceNamespace,
  ceServerUrl,
  ceCommonData,
  ceMapData
}

/*
 * Copyright 2018-2022 the original author or authors.
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
 * @module test
 * @private
 */

// strict-related options for ce creation
const ceOptionsNoStrict = { strict: false } // same as default in ce
const ceOptionsStrict = { strict: true }

// strict-related options for ce validation
const valOptionsNoOverride = { strict: null } // same as default in validator
const valOptionsNoStrict = { strict: false }
const valOptionsStrict = { strict: true }

// other general ce validation (and others) related options
const valOnlyValidAllInstance = { onlyValid: false } // all instances, valid and not, default
const valOnlyValidInstance = { onlyValid: true } // only valid instances
const valDebugInfoDisable = { printDebugInfo: false } // default
const valDebugInfoEnable = { printDebugInfo: true }
const valExcludeExtensionsDisable = { skipExtensions: false } // default
const valExcludeExtensionsEnable = { skipExtensions: true }

// define some common attributes
const commonEventTime = new Date()
const fixedEventTime = { time: commonEventTime } // set a fixed value, to use mainly in tests
const ceCommonOptions = {
  // time: new Date(), // same as default
  time: commonEventTime, // to simplify tests, keep it with a fixed value here
  // time: null, // more useful here, like in normal situations where event timestamp has to be created each time
  datacontenttype: 'application/json',
  dataschema: 'http://my-schema.localhost.localdomain/v1/',
  subject: 'subject',
  ...ceOptionsNoStrict // same as default in ce
}
const ceCommonOptionsStrict = { ...ceCommonOptions, ...ceOptionsStrict }

const ceCommonExtensions = { exampleextension: 'value' } // example extension
const ceReservedExtensions = { id: -1, data: 'data attribute in extension' } // example (bad) extension, use a standard property in extensions, not good for creation in strict mode
const ceNamespace = 'com.github.smartiniOnGitHub.fastify-cloudevents.testevent-v1.0.0'
const ceServerUrl = '/test'

const ceCommonData = { hello: 'world', year: 2020, enabled: true }
const ceDataAsJSONString = JSON.stringify(ceCommonData) // same as = '{ "hello": "world", "year": 2020, "enabled": true }'
const ceDataAsString = 'Hello World, 2020'
const ceDataAsStringEncoded = 'SGVsbG8gV29ybGQsIDIwMjA='
const ceDataXMLAsString = '<data "hello"="world" "year"="2020" />'
const ceOptionsWithDataInBase64 = { ...ceCommonOptions, datainbase64: ceDataAsStringEncoded }

const ceDataNested = {
  ...ceCommonData,
  nested1: {
    level1attribute: 'level1attributeValue',
    nested2: {
      level2attribute: 'level2attributeValue',
      nested3: {
        level3attribute: 'level3attributeValue'
      }
    }
  }
}

const ceCommonOptionsForTextData = { ...ceCommonOptions, datacontenttype: 'text/plain' }

const ceMapData = new Map() // empty Map
// const ceMapData = new Map(['key-1', 'value 1'], ['key-2', 'value 2'])
ceMapData.set('key-1', 'value 1')
ceMapData.set('key-2', 'value 2')

const ceArrayData = [null, 'value 1', 'value 2', 'value 3'] // set even one item as null

// sample function to calculate a random string (given the length), to use in tests here
function getRandomString (length) {
  let str = Math.random().toString(36).substring(2)
  while (str.length < length) {
    str += Math.random().toString(36).substring(2)
  }
  return str.substring(0, length)
}

module.exports = {
  ceArrayData,
  ceCommonData,
  ceCommonExtensions,
  ceCommonOptions,
  ceCommonOptionsForTextData,
  // ceCommonOptionsForXMLData,
  ceCommonOptionsStrict,
  ceDataAsJSONString,
  ceDataAsString,
  ceDataAsStringEncoded,
  ceDataNested,
  ceDataXMLAsString,
  // ceExtensionStrict,
  ceMapData,
  ceNamespace,
  ceOptionsNoStrict,
  ceOptionsStrict,
  ceOptionsWithDataInBase64,
  ceReservedExtensions,
  ceServerUrl,
  commonEventTime,
  fixedEventTime,
  getRandomString,
  valDebugInfoDisable,
  valDebugInfoEnable,
  valExcludeExtensionsDisable,
  valExcludeExtensionsEnable,
  valOnlyValidAllInstance,
  valOnlyValidInstance,
  valOptionsNoOverride,
  valOptionsNoStrict,
  valOptionsStrict
}

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

/**
 * Common-Test-Factory:
 * Utility module to provide some factory functions to create instances to use in tests.
 * @module test
 * @private
 */

const assert = require('node:assert').strict

// get a reference only to cloudevent class definition/s
const {
  CloudEvent,
  CloudEventValidator: V,
  CloudEventTransformer: T,
  JSONBatch
} = require('../src/constructor') // from local path
assert(CloudEvent !== null && V !== null && T !== null && JSONBatch !== null)

// import some common example data
const {
  // commonEventTime,
  ceCommonData,
  ceCommonExtensions,
  ceCommonOptions,
  ceCommonOptionsForTextData,
  ceCommonOptionsForXMLData,
  ceCommonOptionsStrict,
  ceDataAsJSONString,
  ceDataAsString,
  ceDataAsStringEncoded,
  ceDataNested,
  ceDataXMLAsString,
  ceNamespace,
  // ceOptionsNoStrict,
  ceOptionsStrict,
  ceReservedExtensions,
  ceServerUrl,
  getRandomString,
  ceMapData
} = require('./common-test-data')

// define factory functions
function createEmpty () {
  return new CloudEvent() // create an empty CloudEvent instance (not valid for the validator, even in default case, when strict mode flag is disabled)
}

function createMinimalMandatoryUndefined (overrideOptions = {}) {
  return new CloudEvent(undefined, undefined, undefined, undefined,
    { ...overrideOptions }
  ) // expected success if no strict (default) and failure if strict
}

function createMinimalMandatoryNull (overrideOptions = {}) {
  return new CloudEvent(null, null, null, null,
    { ...overrideOptions }
  ) // expected success if no strict (default) and failure if strict
}

function createMinimalBadSource () {
  return new CloudEvent('1/minimal-bad-source', ceNamespace, 'source (bad in strict mode)', null)
}

function createMinimal () {
  return new CloudEvent('1/minimal', // id
    ceNamespace, // type
    '/', // source
    {} // data (empty object) // optional, but useful the same in this sample usage
  )
}

function createMinimalStrict () {
  return new CloudEvent('1/minimal-strict', // id
    ceNamespace, // type
    '/', // source
    null, // data // optional, but useful the same in this sample usage
    ceOptionsStrict
  )
}

function createFull (overrideOptions = {}) {
  return new CloudEvent('2/full',
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    { ...ceCommonOptions, ...overrideOptions },
    ceCommonExtensions
  )
}

function createFullBadIdAndExtension (overrideOptions = {}) {
  return new CloudEvent(null,
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    { ...ceCommonOptions, ...overrideOptions },
    {}
  )
}

function createFullBadExtension () {
  return new CloudEvent('2/full-no-strict/bad-use-reserved-extension',
    ceNamespace,
    ceServerUrl,
    ceCommonData,
    ceCommonOptions,
    { ...ceCommonExtensions, ...ceReservedExtensions } // use some good extensions and some with reserved names (so bad)
  )
}

function createFullBadExtensionStrict () {
  let ce
  try {
    ce = new CloudEvent('2/full-strict/bad-use-reserved-extension',
      ceNamespace,
      ceServerUrl,
      ceCommonData,
      ceCommonOptionsStrict,
      { ...ceCommonExtensions, ...ceReservedExtensions } // use some good extensions and some with reserved names (so bad)
    )
  } catch (e) {
    ce = null
  }
  return ce
}

function createFullUndefinedData (overrideOptions = {}) {
  return new CloudEvent('3/full-undefined-data',
    ceNamespace,
    ceServerUrl,
    undefined, // data
    { ...ceCommonOptions, ...overrideOptions },
    ceCommonExtensions
  )
}

function createFullNullData (overrideOptions = {}) {
  return new CloudEvent('3/full-undefined-data',
    ceNamespace,
    ceServerUrl,
    null, // data
    { ...ceCommonOptions, ...overrideOptions },
    ceCommonExtensions
  )
}

function createFullMapData (overrideOptions = {}) {
  return new CloudEvent('3/full-map-data',
    ceNamespace,
    ceServerUrl,
    ceMapData, // data
    { ...ceCommonOptions, ...overrideOptions },
    ceCommonExtensions
  )
}

function createFullNestedData (overrideOptions = {}) {
  return new CloudEvent('3/full-no-strict-nested-data',
    ceNamespace,
    ceServerUrl,
    ceDataNested,
    { ...ceCommonOptions, ...overrideOptions },
    ceCommonExtensions
  )
}

function createFullTextDataBadContentType (overrideOptions = {}) {
  return new CloudEvent('4/no-strict-text-data-bad-content-type',
    ceNamespace,
    ceServerUrl,
    ceDataAsString, // data
    { ...ceCommonOptions, ...overrideOptions }, // ok but not in strict validation
    ceCommonExtensions
  )
}

function createFullTextData (overrideOptions = {}) {
  return new CloudEvent('4/no-strict-text-data',
    ceNamespace,
    ceServerUrl,
    ceDataAsString, // data
    { ...ceCommonOptionsForTextData, ...overrideOptions },
    ceCommonExtensions
  )
}

function createFullBinaryData (overrideOptions = {}) {
  return new CloudEvent('5/full-no-strict-binary-data',
    ceNamespace,
    ceServerUrl,
    null, // null data
    { ...ceCommonOptions, datainbase64: ceDataAsStringEncoded, ...overrideOptions }, // use common options, and set binary data in base64
    ceCommonExtensions
  )
}

function createFullStrictJSONTextData () {
  return new CloudEvent('6/full-strict-json-string-data',
    ceNamespace,
    ceServerUrl,
    ceDataAsJSONString, // JSON string for data
    ceCommonOptionsStrict, // use strict options
    ceCommonExtensions
  )
}

function createFullXMLData (overrideOptions = {}) {
  return new CloudEvent('7/full-no-strict-xml-string-data',
    ceNamespace,
    ceServerUrl,
    ceDataXMLAsString, // XML string for data
    { ...ceCommonOptionsForXMLData, ...overrideOptions }, // specify XML type
    ceCommonExtensions
  )
}

function createFullDataAsXMLType (overrideOptions = {}) {
  return new CloudEvent('8/full-no-strict-data-as-xml-type',
    ceNamespace,
    ceServerUrl,
    ceCommonData, // object for data
    { ...ceCommonOptionsForXMLData, ...overrideOptions }, // specify XML type
    ceCommonExtensions
  )
}

function createFullDataAsJSONNonDefaultType () {
  return new CloudEvent('9/full-no-strict-data-as-json-non-default-type',
    ceNamespace,
    ceServerUrl,
    ceCommonData, // object for data
    {
      ...ceCommonOptions,
      datacontenttype: 'text/json' // set a non default JSON type
    },
    ceCommonExtensions
  )
}

function createFullDataAsJSONNonDefaultTypeStrict () {
  return new CloudEvent('9/full-strict-data-as-json-non-default-type',
    ceNamespace,
    ceServerUrl,
    ceCommonData, // object for data
    {
      ...ceCommonOptionsStrict,
      datacontenttype: 'text/json' // set a non default JSON type
    },
    ceCommonExtensions
  )
}

// create a sample string big (more than 64 KB)
const bigStringLength = 100_000
const bigString = getRandomString(bigStringLength) // a random string with n chars

function createFullBigStringData (overrideOptions = {}) {
  return new CloudEvent('11/full-no-strict-text-big-string-data',
    ceNamespace,
    ceServerUrl,
    { random: bigString }, // data
    { ...ceCommonOptions, ...overrideOptions },
    ceCommonExtensions
  )
}

function createFullBigBinaryData (base64Data = '', overrideOptions = {}) {
  return new CloudEvent('12/full-no-strict-binary-big-base64-data',
    ceNamespace,
    ceServerUrl,
    null, // null data
    { ...ceCommonOptions, datainbase64: base64Data, ...overrideOptions }, // use common options, and set binary data in base64
    ceCommonExtensions
  )
}

module.exports = {
  createEmpty,
  createFull,
  createFullBadExtension,
  createFullBadExtensionStrict,
  createFullBadIdAndExtension,
  createFullBigBinaryData,
  createFullBigStringData,
  createFullBinaryData,
  createFullDataAsJSONNonDefaultType,
  createFullDataAsJSONNonDefaultTypeStrict,
  createFullDataAsXMLType,
  createFullMapData,
  createFullNestedData,
  createFullNullData,
  createFullStrictJSONTextData,
  createFullTextData,
  createFullTextDataBadContentType,
  createFullUndefinedData,
  createFullXMLData,
  createMinimal,
  createMinimalBadSource,
  createMinimalMandatoryNull,
  createMinimalMandatoryUndefined,
  createMinimalStrict
}

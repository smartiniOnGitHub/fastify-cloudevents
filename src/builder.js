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
 * Builder:
 * Utility module to export builder functions useful for creating
 * values (grouped or not) to use in Cloudevents.
 * Should not be used outside of the plugin.
 *
 * @param {!object} options configuration options
 * @return {object} an object with builder functions (configured) to use
 * @private
 */

const { CloudEventTransformer } = require('cloudevent') // get CloudEvent definition and related utilities

function builder (options = {}) {
  const {
    pluginName,
    pluginVersion,
    serverUrl,
    serverUrlMode,
    // baseNamespace,
    // idGenerator,
    includeHeaders
  } = options

  return {
    /**
     * Build the value for the source field of the CloudEvent,
     * depending on the plugin configuration of options
     * `serverUrlMode`, `serverUrl`,
     * and the uri part of the current request.
     * Note that this is mainly for usage inside the plugin,
     * but in some cases could be useful even outside.
     *
     * @param {string} url the uri part of the current request
     * @return {string} the source value to use, as a string
     * @private
     */
    buildSourceUrl (url = '') {
      let sourceUrl
      switch (serverUrlMode) {
        case null:
        case 'pluginAndRequestSimplified':
          sourceUrl = serverUrl + CloudEventTransformer.uriStripArguments(url)
          break
        case 'pluginAndRequestUrl':
          sourceUrl = serverUrl + url
          break
        case 'pluginServerUrl':
          sourceUrl = serverUrl
          break
        case 'requestUrl':
          sourceUrl = url
          break
        default:
          throw new Error(`Illegal value for serverUrlMode: '${serverUrlMode}'`)
      }
      return sourceUrl
    },

    /**
     * Extract and build the value for the client IP address,
     * useful to add into the CloudEvent in a custom attribute inside data.
     *
     * @param {!object} request the request
     * @return {string} the IP address, as a string
     * @private
     */
    buildClientIP (request) {
      if (request === undefined || request === null) {
        throw new Error('Illegal value for request: undefined or null')
      }
      return request.ip
    },

    /**
     * Extract and build the value for the HTTP headers,
     * useful to add into the CloudEvent in a custom attribute inside data.
     * If related plugin flag 'includeHeaders' is enabled headers will be returned,
     * otherwise null.
     *
     * @param {!object} request the request
     * @return {string} HTTP request headers, as a string, or null
     * @private
     */
    buildHeaders (request) {
      if (request === undefined || request === null) {
        throw new Error('Illegal value for request: undefined or null')
      }
      const headers = (includeHeaders === null || includeHeaders === false) ? null : request.headers
      return headers
    },

    /**
     * Extract and build values from the given arguments,
     * and returns them inside a wrapper object.
     *
     * @param {!object} request the request
     * @return {object} an object containing headers, source URL, the IP address
     * @private
     */
    buildValues (request) {
      const clientIp = this.buildClientIP(request)
      const headers = this.buildHeaders(request.headers)
      const sourceUrl = this.buildSourceUrl(request.url)
      return { clientIp, headers, sourceUrl }
    },

    /**
     * Extract some values from the given arguments,
     * and returns them inside a wrapper object
     * to be used in a CloudEvent data (sub-)property.
     *
     * @param {!object} request the request
     * @return {object} an object containing extracted attributes
     * @private
     */
    buildRequestDataForCE (request) {
      return {
        id: request.id,
        // headers,
        // clientIp,
        params: request.params,
        query: request.query,
        body: request.body,
        method: request.req.method,
        url: request.req.url
      }
    },

    /**
     * Extract some values from the given arguments,
     * and returns them inside a wrapper object
     * to be used in a CloudEvent data (sub-)property.
     *
     * @param {!object} reply the reply
     * @return {object} an object containing extracted attributes
     * @private
     */
    buildReplyDataForCE (reply) {
      return {
        statusCode: reply.res.statusCode,
        statusMessage: reply.res.statusMessage,
        finished: reply.res.finished
      }
    },

    /**
     * Extract some values from the given arguments,
     * and returns them inside a wrapper object
     * to be used in a CloudEvent data (sub-)property.
     *
     * @param {!object} reply the reply
     * @return {object} an object containing extracted attributes
     * @private
     */
    buildPluginDataForCE (description = '') {
      return {
        timestamp: CloudEventTransformer.timestampToNumber(),
        description: description,
        name: pluginName,
        version: pluginVersion
      }
    }
  }
}

module.exports = builder

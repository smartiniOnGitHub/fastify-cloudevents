/*
 * Copyright 2018-2023 the original author or authors.
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
 * @module utility
 */

/**
 * Get a reference to CloudEvent class definition and related utilities.
 * See {@link CloudEvent}.
 * @private
 */
const { CloudEvent, CloudEventTransformer } = require('cloudevent')

/**
 * Utility function for creating grouped values to use in Cloudevents.
 * Should not be used outside of the plugin.
 *
 * @param {!object} options configuration options
 * @return {object} an object with builder functions (configured) to use
 * @private
 */
function builder (options = {}) {
  const {
    pluginName,
    pluginVersion,
    serverUrl,
    serverUrlMode,
    baseNamespace,
    idGenerator,
    includeHeaders,
    includeRedundantAttributes,
    cloudEventOptions,
    cloudEventExtensions
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
     * @param {string} [url='']  the uri part of the current request
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
     * useful to add into the CloudEvent in a custom attribute inside data,
     * otherwise nothing.
     *
     * @param {!object} request the request
     * @return {string} the IP address, as a string or undefined
     * @private
     */
    buildClientIP (request) {
      if (request === undefined || request === null) {
        throw new Error('Illegal value for request: undefined or null')
      }
      return request.ip || undefined
    },

    /**
     * Extract and build the value for the HTTP headers,
     * useful to add into the CloudEvent in a custom attribute inside data.
     * If plugin flag 'includeHeaders' is enabled, headers will be returned,
     * otherwise nothing.
     * Note that some config options for builders are used here.
     *
     * @param {!object} request the request
     * @return {string} HTTP request headers, as a string, or undefined
     * @private
     */
    buildHeaders (request) {
      if (request === undefined || request === null) {
        throw new Error('Illegal value for request: undefined or null')
      }
      const headers = (includeHeaders === null || includeHeaders === false) ? undefined : request.headers
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
      const headers = this.buildHeaders(request)
      const sourceUrl = this.buildSourceUrl(request.raw.url)
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
        headers: this.buildHeaders(request),
        clientIp: this.buildClientIP(request),
        params: request.params,
        query: request.query,
        body: request.body,
        method: request.raw.method,
        url: request.raw.url
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
        statusCode: reply.raw.statusCode,
        statusMessage: reply.raw.statusMessage,
        finished: reply.raw.finished
      }
    },

    /**
     * Extract some values from the given arguments,
     * and returns them inside a wrapper object
     * to be used in a CloudEvent data (sub-)property.
     * Note that some config options for builders are used here.
     *
     * @param {object} [description='']  the description (maybe related to the event)
     * @return {object} an object containing extracted attributes
     * @private
     */
    buildPluginDataForCE (description = '') {
      return {
        timestamp: CloudEventTransformer.timestampToNumber(),
        description,
        name: pluginName,
        version: pluginVersion
      }
    },

    /**
     * Build a CloudEvent instance from the given arguments,
     * useful for simplify plugin hooks.
     * If plugin flag 'includeRedundantAttributes' is enabled,
     * some redundant attributes will be added to data.
     * Note that some config options for builders are used here.
     *
     * @param {!string} hookName the name of the hook
     * @param {!object} request the request
     * @param {object} reply the reply
     * @param {object} payload the payload
     * @return {object} the CloudEvent instance
     * @private
     */
    buildCloudEventForHook (hookName, request, reply, payload) {
      if (!hookName || !request) {
        throw new Error('Illegal arguments: mandatory argument undefined or null')
      }
      const ceData = {
        request: this.buildRequestDataForCE(request),
        reply: (reply === null) ? undefined : this.buildReplyDataForCE(reply),
        payload
      }
      if (includeRedundantAttributes !== null && includeRedundantAttributes === true) {
        ceData.id = request.id
        ceData.timestamp = CloudEventTransformer.timestampToNumber()
      }
      const ce = new CloudEvent(idGenerator.next().value,
        `${baseNamespace}.${hookName}`,
        this.buildSourceUrl(request.raw.url),
        ceData,
        cloudEventOptions,
        cloudEventExtensions
      )
      return ce
    }
  }
}

module.exports = builder

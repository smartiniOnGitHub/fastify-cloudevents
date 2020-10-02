# fastify-cloudevents

  [![NPM Version](https://img.shields.io/npm/v/fastify-cloudevents.svg?style=flat)](https://npmjs.org/package/fastify-cloudevents/)
  [![NPM Downloads](https://img.shields.io/npm/dm/fastify-cloudevents.svg?style=flat)](https://npmjs.org/package/fastify-cloudevents/)
  [![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
  [![Coverage Status](https://coveralls.io/repos/github/smartiniOnGitHub/fastify-cloudevents/badge.svg?branch=master)](https://coveralls.io/github/smartiniOnGitHub/fastify-cloudevents/?branch=master)
  [![dependencies Status](https://david-dm.org/smartiniOnGitHub/fastify-cloudevents/status.svg)](https://david-dm.org/smartiniOnGitHub/fastify-cloudevents)
  [![devDependencies Status](https://david-dm.org/smartiniOnGitHub/fastify-cloudevents/dev-status.svg)](https://david-dm.org/smartiniOnGitHub/fastify-cloudevents?type=dev)
  [![Known Vulnerabilities](https://snyk.io//test/github/smartiniOnGitHub/fastify-cloudevents/badge.svg?targetFile=package.json)](https://snyk.io//test/github/smartiniOnGitHub/fastify-cloudevents?targetFile=package.json)

Fastify Plugin to transform events in/from the CloudEvents standard format.

Current release uses the v1.0 of the CloudEvents Spec.

The purpose of this plugin is to let Fastify web applications create instances of CloudEvents 
in a simple way (with some useful defaults), or in a full way (all attributes).
Optionally, it's possible to validate created instances to be sure they are compliant 
with the standard.
Then, created instances can be serialized, for example to be sent (or saved/stored) somewhere.
It's possible even to deserialize (parse) a string into a CloudEvent instance.

Other features of the plugin: enable forwarding of Fastify events to given callbacks (using hooks), 
and wrapping main data of the original event in a specific CloudEvent instance.


Note that all CloudEvents features exposed here are in the the library 
[cloudevent](https://npmjs.org/package/cloudevent/).


## Usage

```js
const fastify = require('fastify')()

// define functions to use in plugin configuration:
// idExample generator, callbackExample(ce) , etc ...

// register the plugin with some options, for example:
fastify.register(require('fastify-cloudevents'), {
  serverUrl: 'http://0.0.0.0:3000',
  idGenerator: idExample,
  onRequestCallback: callbackExample,
  onErrorCallback: callbackExample,
  onResponseCallback: callbackExample,
  cloudEventOptions: { }
})

// implementation ...

fastify.listen(3000)
```

In the [example](./example/) folder there are some simple server scripts 
that uses the plugin (inline but it's the same using it from npm registry): 
- `example` is a simple one
- `example-enhanced` is a more complex sample 
  to show even how to raise own events (normal, errors, and some custom)


## Requirements

Fastify ^2.15.0 , Node.js 8.17.x or later.
Note that plugin releases 2.x are for Fastify 2.x, etc.


## Note

The plugin decorate Fastify and expose some functions:
- `CloudEvent`, the CloudEvent implementation, as a class
- `CloudEventTransformer`, the CloudEventTransformer utility class
- `JSONBatch`, the class to handle JSONBatch instances
- `cloudEventSerializeFast`, a serialize function implemented here using `fast-json-stringify` 
  and not standard JSON serialization functions; note that similar features of the underlying library 
  has been implemented here (like serialization options)

Plugin options are:
- `serverUrl`, the URL (absolute, or relative) of the current webapp, 
  to use as a base `source` in generated CloudEvents
- `serverUrlMode`, the mode to build the `source` attribute in generated CloudEvents; 
  any not null value will cause this setting to be added to extensions (if set not null in plugin options):
  - null, (default value) same as 'pluginAndRequestSimplified'
  - 'pluginServerUrl', use only the given `serverUrl`
  - 'pluginAndRequestUrl', use the given `serverUrl` and add the current request url
  - 'pluginAndRequestSimplified', use the given `serverUrl` and add the current request url, 
    but without arguments (if any)
  - 'requestUrl', use only the request url
  - anything other, will raise an `Error`
- `baseNamespace`, a base namespace for the `type`; more specific suffix 
  should be added to it in any CloudEvent
- `idGenerator`, a generator function that returns the id (if possible, unique) for any CloudEvent
- `includeHeaders`, a boolean flag to add request headers in generated CloudEvents when `true`
  (by default is `false`)
- `includeHttpAttributes`, a boolean flag to add some HTTP attributes in generated CloudEvents when `true`
  (by default is `false`)
- `includeRedundantAttributes`, a boolean flag to add some redundant attributes
  in the data section of generated CloudEvents when `true` (by default is `false`)
- `onRequestCallback`, callback to handle generated CloudEvents in Fastify hook `onRequest`
- `preParsingCallback`, callback to handle generated CloudEvents in Fastify hook `preParsing`
- `preValidationCallback`, callback to handle generated CloudEvents in Fastify hook `preValidation`
- `preHandlerCallback`, callback to handle generated CloudEvents in Fastify hook `preHandler`
- `preSerializationCallback`, callback to handle generated CloudEvents in Fastify hook `preSerialization`
- `onErrorCallback`, callback to handle generated CloudEvents in Fastify hook `onError`
- `onSendCallback`, callback to handle generated CloudEvents in Fastify hook `onSend`
- `onResponseCallback`, callback to handle generated CloudEvents in Fastify hook `onResponse`
- `onCloseCallback`, callback to handle generated CloudEvents in Fastify hook `onClose`, for the plugin
- `onRouteCallback`, callback to handle generated CloudEvents in Fastify hook `onRoute`
- `onRegisterCallback`, callback to handle generated CloudEvents in Fastify hook `onRegister`
- `onReadyCallback`, callback to handle the generated CloudEvent in Fastify lifecycle function `ready`, 
  for the plugin (when the plugin has been loaded)
- `cloudEventOptions`, CloudEvent options common to all generated event instances; 
  anyway objects are copied to not be shared between instances

all plugin options are optional, and have a default value.

Note that all callbacks given to hooks accepts only a single argument: the generated CloudEvent instance, 
and *not* arguments like in error-first callbacks: (error, data), because here is not really needed.

Note that there is even the ability to validate CloudEvent instances 
in a stricter way, by setting to true the attribute 'strict' in constructor options; 
that attribute (when set) will be put in the extensions of the instance.
Otherwise you can specify it only during validation, in validation options.

You can find Code Documentation for the API of the library 
[here](https://smartiniongithub.github.io/cloudevent.js/).

Since v0.2 of the spec, there is no more a standard attribute to specify the version 
of any specific event type, so the best if to follow their recommendations, 
and for example add a version in the 'type' attribute 
(for example '-v1.0.0' at the end of its base value, or at the end of its full value),
or into the 'schemaurl' attribute but only its major version 
(like '-v1' or '/v1/' at the end).
Since v0.3 of the spec, extensions are no more inside a specific attribute; 
as recommended even mine (for the 'strict' mode for example) has been moved into a namespaced one;
plugin extensions ('serverUrlMode') has been moved in another (specific) namespace.
Since v1.0 of the spec, some properties has been removed/simplified; 
extension properties must be simple (no nested properties) 
and must contain only lowercase letters and numbers in the name (and less than 20 chars in total); 
so for example my strict extension now is 'strictvalidation' with a boolean value.
Even my plugin extension now is 'fastifyserverurlmode' with a string value.

For more info on the standard, see the [CloudEvents Specification](https://github.com/cloudevents/spec).


## Contributing

1. Fork it ( https://github.com/smartiniOnGitHub/fastify-cloudevents/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request


## License

Licensed under [Apache-2.0](./LICENSE).

----

# fastify-cloudevents

  [![NPM Version](https://img.shields.io/npm/v/fastify-cloudevents.svg?style=flat)](https://npmjs.org/package/fastify-cloudevents/)
  [![NPM Downloads](https://img.shields.io/npm/dm/fastify-cloudevents.svg?style=flat)](https://npmjs.org/package/fastify-cloudevents/)
  [![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
  [![Coverage Status](https://coveralls.io/repos/github/smartiniOnGitHub/fastify-cloudevents/badge.svg?branch=master)](https://coveralls.io/github/smartiniOnGitHub/fastify-cloudevents/?branch=master)
  [![dependencies Status](https://david-dm.org/smartiniOnGitHub/fastify-cloudevents/status.svg)](https://david-dm.org/smartiniOnGitHub/fastify-cloudevents)
  [![devDependencies Status](https://david-dm.org/smartiniOnGitHub/fastify-cloudevents/dev-status.svg)](https://david-dm.org/smartiniOnGitHub/fastify-cloudevents?type=dev)

Fastify Plugin to transform events in/from the CloudEvents standard format.

The purpose of this plugin is to let Fastify web applications create instances of CloudEvents 
in a simple way (with some useful defaults), or in a full way (all attributes).
Optionally, it's possible to validate created instances to be sure they are compliant 
with the standard.
Then, created instances can be serialized, for example to be sent (or saved/stored) somewhere.
It's possible even to deserialize (parse) a string into a CloudEvent instance.

Other features of the plugin: enable forwarding of Fastify events to given callbacks (using hooks), 
and wrapping main data of the original event in a specific CloudEvent instance.


Note that all CloudEvents features exposed here, by using the library [cloudevent](https://npmjs.org/package/cloudevent/).


## Usage

```js
const fastify = require('fastify')()

// define functions to use in plugin configuration:
// idExample , callbackExample , etc ...

// register the plugin with some options, for example:
fastify.register(require('fastify-cloudevents'), {
  serverUrl: 'http://0.0.0.0:3000',
  idGenerator: idExample,
  onRequestCallback: callbackExample,
  cloudEventOptions: { }
})

// implementation ...

fastify.listen(3000)
```

In the [example](./example/) folder there are some simple server scripts 
that uses the plugin (inline but it's the same using it from npm registry): 
- `example` is a simple one
- `example-enhanced` is a more complex sample 
  to show even how to raise own events (normal an errors)


## Requirements

Fastify ^1.1.0 , Node.js 8.15.x or later.
Note that plugin releases 0.x and 1.x are for Fastify 1.x, 
plugin releases 2.x are for Fastify 2.x, etc.


## Note

The plugin decorate Fastify and expose some functions:
- `CloudEvent`, the CloudEvent implementation, as a class
- `CloudEventTransformer`, the CloudEventTransformer utility class
- `cloudEventSerializeFast`, a serialize function implemented here using `fast-json-stringify` 
  and not standard JSON serialization functions; note that similar features of the underlying library 
  has been implemented here (like serialization options)

Plugin options are:
- `serverUrl`, the URL (absolute, or relative) of the current webapp, 
  to use as a base `source` in generated CloudEvents
- `serverUrlMode`, the mode to build the `source` attribute in generated CloudEvents 
  (any non null value will cause this setting to be aded to the extension attribute):
  - null, (default value) same as 'pluginAndRequestUrl'
  - 'pluginServerUrl', use only the given `serverUrl`
  - 'pluginAndRequestUrl', use the given `serverUrl` and add the current request url
  - 'requestUrl', use only the request url
  - anything other, will raise an `Error`
- `baseNamespace`, a base namespace for the `eventType`; more specific suffix 
  should be added to it in any CloudEvent
- `idGenerator`, a generator function that returns the id (if possible, unique) for any CloudEvent
- `includeHeaders`, a boolean flag that when `true` tells that request headers will be put 
  in generated CloudEvents (but by default is `false`)
- `onRequestCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onRequest`
- `preHandlerCallback`, callback who will handle the generated CloudEvents, in Fastify hook `preHandler`
- `onSendCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onSend`
- `onResponseCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onResponse`
- `onRouteCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onRoute`
- `onCloseCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onClose`
- `onReadyCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onReady`
- `cloudEventOptions`, CloudEvent options common to all generated event instances; 
  anyway objects are copied to not be shared between instances

all plugin options are optional, and have a default value.

Note that all callbacks given to hooks accepts only a single argument: the generated CloudEvent instance, 
and *not* arguments like in error-first callbacks: (error, data), because here is not really needed.


For more info on the standard, see the CloudEvents Specification [here](https://github.com/cloudevents/spec).


## Contributing

1. Fork it ( https://github.com/smartiniOnGitHub/fastify-cloudevents/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request


## License

Licensed under [Apache-2.0](./LICENSE).

----

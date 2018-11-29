# fastify-cloudevents

  [![NPM Version](https://img.shields.io/npm/v/fastify-cloudevents.svg?style=flat)](https://npmjs.org/package/fastify-cloudevents/)
  [![NPM Downloads](https://img.shields.io/npm/dm/fastify-cloudevents.svg?style=flat)](https://npmjs.org/package/fastify-cloudevents/)
  [![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
  [![Coverage Status](https://coveralls.io/repos/github/smartiniOnGitHub/fastify-cloudevents/badge.svg?branch=master)](https://coveralls.io/github/smartiniOnGitHub/fastify-cloudevents/?branch=master)

Fastify Plugin to serialize events in the CloudEvents standard format.

The purpose of this plugin is to let Fastify web applications create instances of CloudEvents in a simple way (with some useful defaults), or in a full way (all attributes).
Optionally, it's possible to validate created instances to be sure they are compliant with the standard.
Then, created instances can be serialized, for example to be sent (or saved/stored) somewhere.

Other features of the plugin: enable forwarding of Fastify events to given callbacks, and wrapping the original event in a specific CloudEvent instance.


Note that all CloudEvents features exposed here, by using the library [cloudevent.js](https://npmjs.org/package/cloudevent.js/).

More features will follow in the plugin.


## Usage

```js
const fastify = require('fastify')()

// define functions to use in plugin configuration:
// idExample , callbackExample , etc ...

// register the plugin with some options, for example:
fastify.register(require('fastify-cloudevents'), {
  idGenerator: idExample,
  onRequestCallback: callbackExample,
  cloudEventOptions: { }
})

// implementation ...

fastify.listen(3000)
```

In the [example](./example/) folder there are some simple server scripts
that uses the plugin (inline but it's the same using it from npm registry),
`example` is a simple one, and `example-enhanced` is a more complex sample
to show even how to raise own events (normal an errors).


## Requirements

Fastify ^1.1.0 .
Node.js 8.14.x or later.


## Note

The plugin decorate Fastify and expose some functions:
- `CloudEvent`, the CloudEvent implementation used here, could be useful
- `cloudEventSerializeFast`, a serialize function implemented here, using `fast-json-stringify` and not standard JSON serialization functions

Plugin options are:
- `serverUrl`, the absolute URL of the current webapp, to use as a base `source` in generated CloudEvents
- `baseNamespace`, a base namespace for the `eventType`, more speficic suffix will be added in any CloudEvent
- `idGenerator`, a generator function that returns the id (if possible, unique) for any CloudEvent
- `includeHeaders`, a boolean flag that when `true` tells that request headers will be put in generated CloudEvents (but by default is `false`)
- `onRequestCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onRequest`
- `preHandlerCallback`, callback who will handle the generated CloudEvents, in Fastify hook `preHandler`
- `onSendCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onSend`
- `onResponseCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onResponse`
- `onRouteCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onRoute`
- `onCloseCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onClose`
- `onReadyCallback`, callback who will handle the generated CloudEvents, in Fastify hook `onReady`
- `cloudEventOptions`, CloudEvent options commomn to all generated event instances; anyway objects are copied to not be shared between instances

all plugin options are optional, and have a default value.


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

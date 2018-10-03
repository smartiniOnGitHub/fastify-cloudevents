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

fastify.register(require('fastify-cloudevents'), {
  // TODO: add plugin options ... wip
})

// TODO: ...

fastify.listen(3000)
```

In the [example](./example/) folder there are some simple server scripts that uses the plugin (inline but it's the same using it from npm registry).


## Requirements

Fastify 0.43.0 or later.
Node.js 8.12.x or later.


## Note

See the CloudEvents Specification [here](https://github.com/cloudevents/spec).


## License

Licensed under [Apache-2.0](./LICENSE).

----
## Contributing

1. Fork it ( https://github.com/smartiniOnGitHub/fastify-cloudevents/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

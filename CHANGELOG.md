# Change Log

## [0.2.1](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.2.1) (2018-12-20)
Summary Changelog:
- Update [cloudevent](https://www.npmjs.com/package/cloudevent) to '0.2.1', 
  to remove JSON schema from here and use that exposed by that library
- Updated dependencies to latest release
- Other small fixes

## [0.2.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.2.0) (2018-12-17)
Summary Changelog:
- Update [cloudevent.js](https://github.com/smartiniOnGitHub/cloudevent.js/) to '0.2.0', 
  with some breaking changes inside (like the source parameter moved outside its options, etc)
- Change dependency from [cloudevent.js](https://www.npmjs.com/package/cloudevent.js) to the new name
  [cloudevent](https://www.npmjs.com/package/cloudevent) more searchable (the old name is deprecated)
- Update Fastify dependencies to '1.1.0' or higher (but on 1.x)
- Add plugin option `serverUrlMode` (by default null) to specify in which mode source 
  must be constructed in generated CloudEvent instances; see in the README for related values to use.
  As a sample, add in the `example-enhanced` with a value to have the same behavior of its default,
  but that way it will be put in CloudEvent extension object.

## [0.1.4](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.1.4) (2018-11-15)
Summary Changelog:
- Tweak implementation for the plugin configuration option `includeHeaders` and update examples

## [0.1.3](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.1.3) (2018-11-14)
Summary Changelog:
- Add the plugin configuration option `includeHeaders` so that when `true` all request headers will be put in generated CloudEvents (but by default is `false`)
- Update both examples with both values for the plugin configuration option `includeHeaders` to se default behavior (written the same) and not

## [0.1.2](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.1.2) (2018-11-13)
Summary Changelog:
- Maintenance release to fix Fastify dependencies to '1.x' to avoid breaking changes because Fastify '2.x' will be released soon
- Updated dependencies to latest Fastify plugin (1.2.1) and Fastify 1.x (1.13.0)

## [0.1.1](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.1.1) (2018-11-06)
Summary Changelog:
- Maintenance release to fix the usage of generator functions (as ID generator), both in the plugin and in all examples

## [0.1.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.1.0) (2018-11-05)
Summary Changelog:
- First release compliant with current CloudEvent Spec (0.1.0), with basic features implemented; more to follow in next releases
- Implement a custom serialization (fast), but only with the default contentType for now
- Provide some Node.js Examples (basic and enhanced)

----

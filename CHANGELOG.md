# Change Log

## [2.0.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.0.0) (unreleased)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/1.0.0...2.0.0)
Summary Changelog:
- Update requirements to Fastify v2
- Update all dependencies
- Add new Hooks (available since Fastify v2) and remove old ones
- Improve data set into CloudEvent instances; 
  make data more consistent using the same builder functions
- Update documentation and examples

## [1.0.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/1.0.0) (2019-03-26)
Summary Changelog:
- Updated all dependencies
- Note that this release number means that the plugin is stable, 
  and for Fastify v1
- Test example server scripts under load, using 
  [clinic](https://www.npmjs.com/package/clinic) and 
  [autocannon](https://www.npmjs.com/package/autocannon), 
  to ensure that there aren't memory leaks, slowness, or other problems
- Small updates in code and examples
- Pin dependency on cloudevent to '0.4.x'

## [0.4.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.4.0) (2019-03-16)
Summary Changelog:
- Update docs and examples to show the usage of new plugin features
- Update all dependencies to latest release, but stay on Fastify v1 for now
- In plugin option `serverUrlMode` add a new value (default choice now) 'pluginAndRequestSimplified' 
  to simplify (remove URL arguments) when building the value for the 'sourceURL' attribute
- In serialize function, add a boolean option 'onlyValid' (by default false) to serialize 
  only a valid CloudEvent instance
- Remove some inline logic and instead use methods exposed by Transformer (from the CloudEvent library)
- Other small improvements to go towards plugin '1.0.0'
- Update tests due to some behavior (for edge cases) was fixed in the CloudEvent library
- Improve (a little) test code coverage for functions exposed by the plugin

## [0.3.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.3.0) (2019-03-04)
Summary Changelog:
- Update [cloudevent](https://www.npmjs.com/package/cloudevent) to '0.3.0', 
  with some breaking changes (as usual for dependency use "cloudevent": "^0.3.0")
- Update docs and examples to show the usage of plugin features
- Update all dependencies to latest release
- Update tests

## [0.2.4](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.2.4) (2019-02-18)
Summary Changelog:
- Change dependencies to stay on [cloudevent](https://www.npmjs.com/package/cloudevent) to '0.2.x', 
  because the '0.3.0' has some breaking changes (so use "cloudevent": "~0.2.2")
- Update all dependencies to latest release
- Update tests

## [0.2.3](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.2.3) (2019-01-22)
Summary Changelog:
- Update [cloudevent](https://www.npmjs.com/package/cloudevent) to '0.2.2', 
  with the ability to get CloudEvent data (payload), 
  and the ability to serialize even with a non default contentType
- Update plugin exposed function for fast serialization ('cloudEventSerializeFast') 
  to accept serialization options (like in 'cloudevent') to be able to serialize 
  even with a non default contentType
- Updated dependencies to latest release
- Updated README with serialization options, and a reference to the new package name 
  of the underlying library
- Add npm custom command to run Tap unit tests with nodejs debugger breaks enabled (inspector)
- Other small fixes

## [0.2.2](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/0.2.2) (2018-12-25)
Summary Changelog:
- Updated dependencies to latest release
- Add client IP address in a custom attribute inside the data section of generated CloudEvent instances

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

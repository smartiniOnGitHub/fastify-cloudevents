# Change Log

## [5.0.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/5.0.0) (2026-02-12)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/4.0.0...5.0.0)
Summary Changelog:
- Updated requirements to Fastify '^5.0.0'
- Updated all dependencies to latest (for Node.js 20 LTS)

## [4.0.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/4.0.0) (2022-08-16)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/3.0.0...4.0.0)
Summary Changelog:
- Updated requirements to Fastify '^4.0.1' and Fastify-plugin '^4.2.0', so require Node.js 14 LTS
- Updated all dependencies to latest (for Node.js 14 LTS)
- Use 'cloudevent' latest release ('~0.10.0') which implements the 
  [v1.0.2 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v1.0.2)
- Ensure all works again
- Update serialize function with some useful options (like in the 'cloudevent' library) 
- Update validate function with the ability to pass custom AJV options if/when needed
- Update and add some hooks for Fastify 4.x; keep them async
- Remove/update some code now deprecated
- Refactor CloudEvents creation in tests, for better consistency
- Ensure all works with latest Node.js 14 LTS and later LTS releases
- Improve JSDoc comments, generated documentation is much better now

## [3.0.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/3.0.0) (2022-04-17)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/2.10.0...3.0.0)
Summary Changelog:
- Update requirements to latest Fastify 3.x and Node.js 10 LTS
- Use 'cloudevent' latest release ('~0.9.0') which implements the 
  [v1.0.2 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v1.0.2)
- Ensure all works again
- Update the plugin to be async (thanks to Fastify 3.x features)
- Update some hooks for Fastify 3.x; keep them async
- Remove/update some code now deprecated
- Ensure all works with latest Node.js 10 (even if in End-of-Life status), 
  12 (even if in End-of-Life status soon), 14 LTS, 16 LTS
- Note: this plugin release has same features of previous release

## [2.10.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.10.0) (2022-04-16)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/2.6.0...2.10.0)
Summary Changelog:
- Update dependency on cloudevent to '0.9.x' which implements the 
  [v1.0.2 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v1.0.2) 
  with some simplifications/clarifications
- Update requirements to latest Fastify 2.x, so currently release '^2.15.3'
- Update all other dependencies
- Breaking change: update requirements to Node.js 10 LTS
- Breaking change: the 'time' attribute now is managed as a string in the ISO format 
  (accordingly with the spec format and schema) but constructor will accept 
  same inputs (undefined/null, a Date, now even a string 
  that could be checked during validation of the event); 
  a getter method 'timeAsDate' has been added just for convenience
- Note: this is last release for Fastify 2.x

## [2.6.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.6.0) (2021-03-28)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/2.5.0...2.6.0)
Summary Changelog:
- Update dependency on cloudevent to '0.8.x' which implements the 
  [v1.0.1 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v1.0.1) 
  with many simplifications/clarifications on v1.0
- Update requirements to latest Fastify 2.x, so currently release '^2.15.3' 
- Feature: keep compatibility with Node.js 8 (only for plugin releases 2.x)
- Feature: add to Fastify a decorator to return the JSONSchema (for a CloudEvent) 
  used in the plugin (with some small tweaks), instead of retrieving it 
  from the underlying library
- Feature: update fast serialization to handle even data as value (string or boolean or number) 
  with datacontenttype not default (for example 'text/plain')
- Feature: add to Fastify a decorator to add a function that validates with a schema compiler 
  and return validation results and errors (if any)
- Feature: generate documentation from sources with JSDoc

## [2.5.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.5.0) (2020-10-02)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/2.4.0...2.5.0)
Summary Changelog:
- Update requirements to latest Fastify 2.x, so currently release '^2.15.0' 
- Feature: update the 'onReady' hook due to an improvement done in Fastify 2.15.0
- Feature: keep compatibility with Node.js 8 (only for plugin releases 2.x)

## [2.4.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.4.0) (2020-10-01)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/2.3.0...2.4.0)
Summary Changelog:
- Update dependency on cloudevent to '0.7.x' which implements the 
  [v1.0 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v1.0) 
  with all breaking changes since its v0.3
- Update requirements to a more recent Fastify, release '^2.12.0' 
- Feature: keep compatibility with Node.js 8
- Update dependencies for the development environment
- Other minor changes

## [2.3.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.3.0) (2019-11-08)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/2.2.0...2.3.0)
Summary Changelog:
- Update dependency on cloudevent to '0.6.x' which implements the 
  [v0.3 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v0.3) 
  with all breaking changes since its v0.2
- Breaking Change: CloudEvent constructor signature has changed a little, 
  to handle extensions as per spec
- Breaking Change: CloudEvent attributes has been renamed for better consistency with the spec, 
  and renamed related methods too
- Updated all dependencies
- Update requirements to a more recent Fastify, release '^2.7.1'
- Updated documentation and samples to describe/show changes and the new behavior
- Export even JSONBatch via Fastify decorators
- Add plugin option flags to enable the output of redundant attributes and HTTP attributes
- Fix usage of request url (fix already present in 2.2.1)
- Clarify and cleanup docs and examples
- Add npm custom commands to run examples and tests in debug mode
- Other minor changes

## [2.2.1](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.2.1) (2019-10-23)
Summary Changelog:
- Updated all dependencies
- Fix usage of request url

## [2.2.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.2.0) (2019-05-02)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/2.0.0...2.2.0)
Summary Changelog:
- Update dependency on cloudevent to '0.5.x' which implements the 
  [v0.2 - CloudEvents Spec](https://github.com/cloudevents/spec/releases/tag/v0.2) 
  with all breaking changes since its v0.1
- Updated dependencies for the development environment
- Updated documentation and samples to describe/show changes and the new behavior
- Updated Tap unit tests to always run in strict mode, and some refactoring
- Clarify which CloudEvents Spec version is implemented in the current release

## [2.0.0](https://github.com/smartiniOnGitHub/fastify-cloudevents/releases/tag/2.0.0) (2019-04-08)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-cloudevents/compare/1.0.0...2.0.0)
Summary Changelog:
- Update requirements to Fastify v2
- Update all dependencies
- Breaking Change: add new Hooks (available since Fastify v2) and remove old ones; 
  hook functions arguments has changed in v2, even for already existing hooks.
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

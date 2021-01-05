# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

+ Fixed broken Docker image build

## [3.4.0] - 2021-01-06

### Changed

+ Maintenance release, no feature changes

## [3.3.0] - 2020-09-26

### Changed

+ Maintenance release, no feature changes

## [3.2.0] - 2020-09-15

### Added

+ Added the ability to manually specify the tag and file services to use when
  syncing from hydrus client

### Changed

+ Improved the insertion of mappings for both client and server sync, which
  should hopefully prevent foreign key constraint errors in case hydrus data
  changes during a sync

## [3.1.0] - 2020-09-07

### Changed

+ Maintenance release, no feature changes

## [3.0.0] - 2020-06-22

### Changed

+ Switched to AGPLv3

## [2.16.1] - 2020-06-14

### Fixed

+ Fix wrong Docker repository mentions

## [2.16.0] - 2020-06-14

### Changed

+ Maintenance release, no feature changes

## [2.15.1] - 2020-06-05

### Fixed

+ Added automatic lock file removal when running with Docker to prevent stale
  ones from causing syncs to abort

## [2.15.0] - 2020-05-01

### Changed

+ Maintenance release, no feature changes

## [2.14.0] - 2020-04-16

### Changed

+ Updated dependencies

## [2.13.0] - 2020-03-17

### Changed

+ Updated dependencies

## [2.12.0] - 2020-02-13

### Added

+ Added a setting to optionally make videos autoplay

## [2.11.0] - 2020-02-11

### Changed

+ Expanded the MIME type support
+ Updated dependencies

## [2.10.1] - 2020-01-13

### Fixed

+ Fixed broken media serving after dependency update

## [2.10.0] - 2020-01-12

### Added

+ Added the ability to exclude files with certain tags when syncing

### Changed

+ Simplified the Docker UID/GID handling
+ Updated dependencies

## [2.9.0] - 2019-12-18

### Added

+ Added the ability to use a custom thumbnails path when connected to hydrus
  client

### Changed

+ Updated dependencies

## [2.8.1] - 2019-12-01

### Fixed

+ Fixed changing the file on the file detail view causing the actual media
  element to lag behind and update too late

## [2.8.0] - 2019-11-30

### Added

+ Added a setting to make looping videos optional

### Changed

+ Improved the visual transition when changing the file on the file detail view
+ Updated dependencies

## [2.7.0] - 2019-11-16

### Changed

+ Updated dependencies

## [2.6.0] - 2019-10-24

### Changed

+ Updated dependencies
+ Clarified the wording about the supported Node.js versions

## [2.5.0] - 2019-10-19

### Added

+ Added time zone configuration to Docker Compose example setups
+ Added information about the demo installation

### Changed

+ Updated screenshots
+ Updated dependencies

### Fixed

+ Fixed a visual checkbox bug when using the dark theme

## [2.4.0] - 2019-10-16

### Changed

+ Defined a new default `meta` namespace color that works on both light and
  dark theme
+ Updated dependencies

## [2.3.0] - 2019-10-08

### Added

+ Added dark theme and theme selection

### Changed

+ The Plyr icon sprite is now served locally
+ Hid gallery button if file is not an image
+ Made viewport restriction setting apply to videos as well
+ Refactored code
+ Updated dependencies

## [2.2.1] - 2019-10-05

### Fixed

+ Fixed media files being accessible when providing an invalid token

## [2.2.0] - 2019-09-30

### Added

+ Added a special error message for when an unhandled server error occurs
  during a sync (in which case it very likely occurs due to the database tables
  being in the process of getting replaced)

### Changed

+ Updated dependencies

## [2.1.0] - 2019-09-07

### Added

+ Added fallback to `application/octet-stream` for unknown MIME types

### Changed

+ Updated `*ignore` files
+ Updated dependencies

### Fixed

+ Fixed typo in readme
+ Excluded tags and namespaces for deleted files when connected to hydrus
  server

## [2.0.0] - 2019-08-25

### Added

+ Added the ability to connect to hydrus client instead of hydrus server
+ Added support for IPFS hashes
+ Added the ability to display a tag cloud on the frontpage
+ Added FAQ section to the readme

### Changed

+ Refactored code
+ IP addresses stored with tokens are now truncated to 16 bits for privacy
  reasons
+ Added features overview
+ Updated dependencies

### Fixed

+ Switched to using `Number.MAX_SAFE_INTEGER` instead of an arbitrary large
  number
+ Error titles are now displayed in normal letter case regardless of setting

## [1.1.0] - 2019-08-07

### Added

+ The number of tags are now displayed on the file detail view

### Changed

+ Updated dependencies

### Fixed

+ Fixed Docker Hub badge
+ Fixed server not responding with code `404` when encountering a missing file
+ Fixed custom icon styling affecting the video player

## 1.0.0 - 2019-08-06

### Added

+ Initial release

[Unreleased]: https://github.com/imtbl/hyve/compare/3.4.0...develop
[3.4.0]: https://github.com/imtbl/hyve/compare/3.3.0...3.4.0
[3.3.0]: https://github.com/imtbl/hyve/compare/3.2.0...3.3.0
[3.2.0]: https://github.com/imtbl/hyve/compare/3.1.0...3.2.0
[3.1.0]: https://github.com/imtbl/hyve/compare/3.0.0...3.1.0
[3.0.0]: https://github.com/imtbl/hyve/compare/2.16.1...3.0.0
[2.16.1]: https://github.com/imtbl/hyve/compare/2.16.0...2.16.1
[2.16.0]: https://github.com/imtbl/hyve/compare/2.15.1...2.16.0
[2.15.1]: https://github.com/imtbl/hyve/compare/2.15.0...2.15.1
[2.15.0]: https://github.com/imtbl/hyve/compare/2.14.0...2.15.0
[2.14.0]: https://github.com/imtbl/hyve/compare/2.13.0...2.14.0
[2.13.0]: https://github.com/imtbl/hyve/compare/2.12.0...2.13.0
[2.12.0]: https://github.com/imtbl/hyve/compare/2.11.0...2.12.0
[2.11.0]: https://github.com/imtbl/hyve/compare/2.10.1...2.11.0
[2.10.1]: https://github.com/imtbl/hyve/compare/2.10.0...2.10.1
[2.10.0]: https://github.com/imtbl/hyve/compare/2.9.0...2.10.0
[2.9.0]: https://github.com/imtbl/hyve/compare/2.8.1...2.9.0
[2.8.1]: https://github.com/imtbl/hyve/compare/2.8.0...2.8.1
[2.8.0]: https://github.com/imtbl/hyve/compare/2.7.0...2.8.0
[2.7.0]: https://github.com/imtbl/hyve/compare/2.6.0...2.7.0
[2.6.0]: https://github.com/imtbl/hyve/compare/2.5.0...2.6.0
[2.5.0]: https://github.com/imtbl/hyve/compare/2.4.0...2.5.0
[2.4.0]: https://github.com/imtbl/hyve/compare/2.3.0...2.4.0
[2.3.0]: https://github.com/imtbl/hyve/compare/2.2.1...2.3.0
[2.2.1]: https://github.com/imtbl/hyve/compare/2.2.0...2.2.1
[2.2.0]: https://github.com/imtbl/hyve/compare/2.1.0...2.2.0
[2.1.0]: https://github.com/imtbl/hyve/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/imtbl/hyve/compare/1.1.0...2.0.0
[1.1.0]: https://github.com/imtbl/hyve/compare/1.0.0...1.1.0

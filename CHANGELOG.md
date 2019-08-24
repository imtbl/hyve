# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

+ Added the ability to connect to hydrus client instead of hydrus server
+ Added support for IPFS hashes
+ Added the ability to display a tag cloud on the frontpage

### Changed

+ Refactored code
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

[Unreleased]: https://github.com/mserajnik/hyve/compare/1.1.0...develop
[1.1.0]: https://github.com/mserajnik/hyve/compare/1.0.0...1.1.0

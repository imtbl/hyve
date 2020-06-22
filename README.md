<h1>
  <img
    src="https://github.com/imtbl/hyve/raw/master/media/logo.png"
    alt="hyve logo"
    width="128">
  <br>
  hyve
  <a href="https://travis-ci.com/imtbl/hyve">
    <img src="https://travis-ci.com/imtbl/hyve.svg" alt="Build status">
  </a>
  <a href="https://hub.docker.com/r/mtbl/hyve/">
    <img
      src="https://img.shields.io/docker/cloud/automated/mtbl/hyve.svg"
      alt="Docker Hub build">
  </a>
  <a href="https://standardjs.com">
    <img
      src="https://img.shields.io/badge/code_style-standard-brightgreen.svg"
      alt="JavaScript Standard Style">
  </a>
</h1>

> Expose and consume your hydrus media via HTTP API

hyve is an application that allows you to serve [hydrus][hydrus] media over an
HTTP API. It can connect to either hydrus client or server. A web-based,
[booru][booru]-like client that consumes the API is also included.

As a rough overview, hyve currently has the following features:

+ The ability to connect to either hydrus client or hydrus server
+ A straightforward HTTP API, including:
  + Comprehensive options to search and sort your files and tags
  + Optional authentication and simple user management, allowing you to run
    hyve in either a public or private manner
+ A modern web client that makes use of the API's full feature set and comes
  with:
  + An easy to use interface that is optimized for both desktop and mobile
    devices
  + Direct support for common image and video formats on the web; non-supported
    files can be downloaded and viewed locally
  + Built-in user registration, login and actions like changing username or
    password or deleting the user altogether
  + The ability to save options like tag colors and default sorting methods on
    a per-client basis, allowing you to have different settings in each browser
  + Basic web app features that allow you to add the client to the home screen
    of your smart device and use it just like a native app

__hyve does not allow you to modify or manage your hydrus media in any way,__
__it simply provides a different way to view them.__

## Table of contents

+ [Install](#install)
  + [Installing with Docker](#installing-with-docker)
  + [Installing without Docker](#installing-without-docker)
  + [Dependencies](#dependencies)
  + [Updating](#updating)
    + [Updating with Docker](#updating-with-docker)
    + [Updating without Docker](#updating-without-docker)
    + [Upgrading from `2.x.x` to `3.x.x`](#upgrading-from-2xx-to-3xx)
    + [Upgrading from `1.x.x` to `2.x.x`](#upgrading-from-1xx-to-2xx)
+ [Usage](#usage)
  + [Running with Docker](#running-with-docker)
  + [Running without Docker](#running-without-docker)
  + [Configuration](#configuration)
    + [Client sync configuration](#client-sync-configuration)
    + [Server sync configuration](#server-sync-configuration)
    + [Server configuration](#server-configuration)
    + [Web configuration](#web-configuration)
  + [HTTP API](#http-api)
+ [Demo](#demo)
+ [Screenshots](#screenshots)
+ [FAQ](#faq)
+ [Maintainer](#maintainer)
+ [Contribute](#contribute)
+ [License](#license)

## Install

The recommended way to run is via [Docker][docker]. Basic instructions on how
to run without it are also provided.

### Installing with Docker

To install hyve for running with Docker, you can simply pull the prebuilt image
from [Docker Hub][docker-hub]:

```zsh
user@local:~$ docker pull mtbl/hyve
```

Alternatively, you can also build the image yourself. The user that is used
inside the container has UID `1000` and GID `1000` by default. You can adjust
this (e.g., to match your host UID/GID) by providing the arguments `USER_ID`
and `GROUP_ID` when making a build.

### Installing without Docker

To install without Docker, you can simply clone the repository and install
dependencies:

```zsh
user@local:~$ git clone https://github.com/imtbl/hyve.git
user@local:~$ cd hyve
user@local:hyve$ yarn && yarn bootstrap
```

### Dependencies

+ [hydrus][hydrus] (either the client or the server, depending on what you want
  to connect to)
+ [Docker][docker] (when running with Docker)
+ [Node.js][node-js] (when running without Docker)
+ [Yarn][yarn] (when running without Docker)

hyve should work with both the latest LTS and the latest stable version of
Node.js. If you encounter any issues with either of those versions when running
without Docker, please [let me know][issues].

### Updating

hyve follows [semantic versioning][semantic-versioning] and any breaking
changes that require additional attention will be released under a new major
version (e.g., `2.0.0`). Minor version updates (e.g., `1.1.0` or `1.2.0`) are
therefore always safe to simply install.

When necessary, this section will be expanded with upgrade guides for new major
versions.

#### Updating with Docker

Simply pull the latest Docker image to update:

```zsh
user@local:~$ docker pull mtbl/hyve
```

#### Updating without Docker

If you have installed via cloning the repository, you can update via Git:

```zsh
user@local:hyve$ git pull
user@local:hyve$ yarn && yarn bootstrap
user@local:hyve$ cd services/server
user@local:hyve/services/server$ yarn migrate
```

#### Upgrading from `2.x.x` to `3.x.x`

`3.0.0` has introduced no breaking API changes and merely reflects the switch
to a new license (AGPLv3).

#### Upgrading from `1.x.x` to `2.x.x`

`2.0.0` has introduced the ability to (optionally) connect to hydrus client
instead of hydrus server.

Aside from renaming `services/sync` to `services/sync-server` (which you might
need to adjust in any start scripts you might have set up when running without
Docker), a few environment variables have been added, so you can simply compare
with your current configuration and make additions/adjustments where necessary.

## Usage

hyve consists of three different services:

+ __Sync:__ used to create a modified copy of the hydrus databases that is
  optimized for hyve's purposes and allows for searching and sorting options
  that would otherwise not be possible
  + There are two variants, one for hydrus client and one for hydrus server
+ __Server:__ the server component of hyve that provides the HTTP API
+ __Web:__ the web-based client that connects to the HTTP API

In general, you will probably want to run all three services, unless you plan
to use a different client to connect to the HTTP API.

Depending on on your choice on you want what to connect to, you will also need
to run either hydrus client or server. If you are considering using hyve, you
are probably already familiar with the client. In that case, you can just
continue using it as you normally would. If you want to set up a server (to
connect hyve to that instead), you can find a guide for doing so
[here][hydrus-server-help].

If you plan to expose the HTTP API outside your local network, it is _heavily_
recommended to use HTTPS. To do this, you will likely want to set up a reverse
proxy (I recommend [nginx][nginx]).

hyve uses a lock file called `.sync-lock` to prevent additional syncs from
running while one is already in progress. This file is located in the same
directory as hyve's content database. In some instances (e.g., shutdown during
a sync), this file might not be removed (causing it to become _stale_). In that
case, you may have to delete it manually before attempting to run the next
sync. When running with Docker, the lock file (should it exist at that point)
will automatically get removed during sync container startup for your
convenience (keep this in mind if you are sharing the same hyve content
database between multiple instances).

### Running with Docker

To make running with Docker as easy as possible, a working
[Docker Compose][docker-compose] example setup is provided. This setup also
includes a [dockerized hydrus server][hydrus-server-docker] and stores the data
inside a named volume (which you might want to adjust if you are a more
experienced Docker user).

Running hyve with hydrus server might be preferable if you want to manage your
media with a local hydrus client and are fine with pushing any files you want
to use with hyve to hydrus server.

To get started with the example setup, simply duplicate
`docker-compose.yml.server.example` as `docker-compose.yml`, adjust the
variables in the `environment` section as described [here](#configuration).

In addition to the environment variables configuring the settings for the
respective service, also take note of the time zone set via `TZ` (for each
service). This is particularly important for the sync cron job to run at the
time you expect it to. The time zone has to be set in the
[tz database format][tz-database-time-zones].

Finally, start the containers:

```zsh
user@local:hyve$ docker-compose up -d
```

Afterwards, proceed with the hydrus server setup, upload your files and tags to
it and wait for the first sync to run. The HTTP API and the web client will be
available under the configured URLs.

If you want to connect to hydrus client instead, you can have a look at
[this][hydrus-docker] for a dockerized version of hydrus client that you should
be able to run in combination with hyve. I have included a Docker Compose
example setup only containing the hyve services
(`docker-compose.yml.client.example`) that you will need to expand accordingly
to make it work.

Of course, running hydrus client outside of Docker and using a bind mount to
make the databases and media accessible to a dockerized instance of hyve does
also work.

### Running without Docker

To run without Docker, you will first need to duplicate the `.env.example` in
each service directory (`services/sync-client` or `services/sync-server`,
`services/server` and `services/web`) as `.env` and adjust the variables as
described [here](#configuration).

You will also need to create the content and authentication database files at
your desired location:

```zsh
user@local:hyve$ cd <desired database files location>
user@local:<desired database files location>$ touch content.db && touch authentication.db
```

Next, run migrations for the authentication database:

```zsh
user@local:hyve$ cd services/server
user@local:hyve/services/server$ yarn migrate
```

After that, you can run a sync once you have files in your hydrus client:

```zsh
user@local:hyve$ cd services/sync-client
user@local:hyve/services/sync-client$ yarn sync
```

Or, if you have set up hydrus server and pushed files to it:

```zsh
user@local:hyve$ cd services/sync-server
user@local:hyve/services/sync-server$ yarn sync
```

Then, start the hyve server:

```zsh
user@local:hyve$ cd services/server
user@local:hyve/services/server$ yarn start
```

And finally, build and start the web client:

```zsh
user@local:hyve$ cd services/web
user@local:hyve/services/web$ yarn build && yarn start
```

Alternatively, you can also deploy the `services/web/dist` directory to any
static web server after building to serve the client from there.

The HTTP API and the web client will be available under the configured URLs.
You might also want to set up a cron job to run the sync periodically.

### Configuration

Configuration is done entirely via environment variables. Each of the three
services needs to be configured separately. Please keep in mind that some
options might not work together or might have to match across services for them
to work correctly.

#### Client sync configuration

+ `HYVE_CONTENT_DB_PATH=`: sets the path to hyve's content database.
  __Absolute path required.__
+ `HYVE_HYDRUS_CLIENT_DB_PATH=`: sets the path to the hydrus client main
  database (called `client.db`). __Absolute path required.__
+ `HYVE_HYDRUS_MASTER_DB_PATH=`: sets the path to the hydrus client master
  database (called `client.master.db`). __Absolute path required.__
+ `HYVE_HYDRUS_MAPPINGS_DB_PATH=`: sets the path to the hydrus client mappings
  database (called `client.mappings.db`). __Absolute path required.__
+ `HYVE_HYDRUS_CACHES_DB_PATH=`: sets the path to the hydrus client caches
  database (called `client.caches.db`). __Absolute path required.__
+ `HYVE_HYDRUS_INCLUDE_INBOX=false`: setting this to `true` includes files that
  are in the inbox in the sync.
+ `HYVE_HYDRUS_SUPPORTED_MIME_TYPES=1,2,3,4,9,14,18,20,21,23,25,26,27,33`: the
  IDs of the MIME types hyve should sync from hydrus server. See
  [here][supported-mime-types-client] for the complete list of MIME types you
  can choose from.
+ `HYVE_HYDRUS_EXCLUDED_TAGS=`: tags that are added here separated with `###`
  will cause all files having any of these tags to be excluded from the sync.
+ `HYVE_DOCKER_CRON_SCHEDULE=0 4 * * *`: the cron schedule for running the sync
  inside Docker. Irrelevant if the sync service is run outside of Docker.

#### Server sync configuration

+ `HYVE_CONTENT_DB_PATH=`: sets the path to hyve's content database.
  __Absolute path required.__
+ `HYVE_HYDRUS_SERVER_DB_PATH=`: sets the path to the hydrus server main
  database (called `server.db`). __Absolute path required.__
+ `HYVE_HYDRUS_MASTER_DB_PATH=`: sets the path to the hydrus server master
  database (called `server.master.db`). __Absolute path required.__
+ `HYVE_HYDRUS_MAPPINGS_DB_PATH=`: sets the path to the hydrus server mappings
  database (called `server.mappings.db`). __Absolute path required.__
+ `HYVE_HYDRUS_TAG_REPOSITORY=2`: the ID of the hydrus server tag repository
  hyve should use. This is generally `1 + n`, where `n` is the *n*th repository
  (e.g., for the first repository, `1 + 1` => `2`). Both creating tag and file
  repositories increases `n`.
+ `HYVE_HYDRUS_FILE_REPOSITORY=3`: the ID of the hydrus server file repository
  hyve should use. This is generally `1 + n`, where `n` is the *n*th repository
  (e.g., for the first repository, `1 + 1` => `2`). Both creating tag and file
  repositories increases `n`.
+ `HYVE_HYDRUS_SUPPORTED_MIME_TYPES=1,2,3,4,9,14,18,20,21,23,25,26,27,33`: the
  IDs of the MIME types hyve should sync from hydrus server. See
  [here][supported-mime-types-server] for the complete list of MIME types you
  can choose from.
+ `HYVE_HYDRUS_EXCLUDED_TAGS=`: tags that are added here separated with `###`
  will cause all files having any of these tags to be excluded from the sync.
+ `HYVE_DOCKER_CRON_SCHEDULE=0 4 * * *`: the cron schedule for running the sync
  inside Docker. Irrelevant if the sync service is run outside of Docker.

#### Server configuration

+ `NODE_ENV=development`: defines the environment hyve is running in.
  It currently does not affect anything besides the access logging but it
  should be set to `production` in a live environment and `development` when
  developing.
+ `HYVE_URL=http://localhost:8000`: the URL under which hyve is accessible.
  Used to generate media URLs. __No trailing slashes.__
+ `HYVE_PORT=8000`: the port hyve is listening on. This can be different than
  the port used to access it from outside when proxying via [nginx][nginx]
  (recommended) or similar solutions.
+ `HYVE_API_BASE=/api`: the base path of all the API routes. __No trailing__
  __slashes.__
+ `HYVE_MEDIA_BASE=/media`: the base path of all the media routes.
  __No trailing slashes.__
+ `HYVE_CROSS_ORIGIN_ALLOWED=true`: allows cross-origin requests (useful when
  the application accessing the API is located on a different domain).
+ `HYVE_AUTHENTICATION_DB_PATH=./storage/authentication.db`: the authentication
  database path (absolute or relative). The database must exist and the file
  must be read-/writable by hyve.
+ `HYVE_CONTENT_DB_PATH=./storage/content.db`: the content database path
  (absolute or relative). The database must exist and the file must be
  read-/writable by hyve.
+ `HYVE_HYDRUS_FILES_PATH=`: sets the path to the hydrus client or server files
  directory (called `client_files` or `server_files`). __Absolute path__
  __required.__
+ `HYVE_HYDRUS_THUMBNAILS_PATH=`: overrides the path to the hydrus client
  thumbnails directory (falls back to `HYVE_HYDRUS_FILES_PATH`). This setting
  is ignored when connected to hydrus server. __Absolute path required.__
+ `HYVE_HYDRUS_FILES_MODE=`: lets hyve know the media directory structure and
  file naming. Must be `client` when connecting hyve to hydrus client and
  `server` when connecting to hydrus server. If left empty it will default to
  `server`.
+ `HYVE_NUMBER_OF_WORKERS=`: sets the number of workers. By default, one worker
  per logical CPU core is used. You might want to decrease or increase that
  number, depending on your needs/hardware. In general, the more workers are
  running, the more requests can be handled simultaneously. But note that
  increasing the number of workers beyond the number of logical CPUs might be
  detrimental to performance or cause even more serious issues (e.g., crashes).
+ `HYVE_DB_CHECKPOINT_INTERVAL=3600`: sets the interval (in seconds) at which
  hyve [checkpoints][checkpoint] the authentication database (the content
  database is handled by the sync service).
+ `HYVE_REGISTRATION_ENABLED=true`: setting this to `false` disables the
  creation of new users.
+ `HYVE_AUTHENTICATION_REQUIRED=true`: setting this to `false` allows the
  access of all non-authentication-related routes without providing a (media)
  token, effectively making the API open for anyone to access. This does not
  disable authentication-related routes altogether, it merely makes
  authentication optional.
+ `HYVE_MIN_PASSWORD_LENGTH=16`: sets the minimum password length when creating
  or updating users. Providing a higher value than `1024` will discard the
  value and use `1024` as the minimum length instead.
+ `HYVE_FILES_PER_PAGE=42`: the results per page when listing files.
+ `HYVE_TAGS_PER_PAGE=42`: the results per page when listing tags.
+ `HYVE_MOST_USED_TAGS_LIMIT=20`: the maximum amount of tags returned when
  listing the most used tags.
+ `HYVE_AUTOCOMPLETE_LIMIT=10`: the maximum amount of tag completion results.
+ `HYVE_COUNTS_ENABLED=true`: enables the output of total counts when listing
  files and tags for the cost of response times (especially with larger
  databases).
+ `HYVE_COUNTS_CACHING_ENABLED=true`: setting this to `true` enables the
  caching of file/tag counts (only relevant when `HYVE_COUNTS_ENABLED` is
  `true`). This is recommended for larger databases to decrease response times
  when queries are made that only differ in page and sorting since the count
  will only need to be calculated once (for the first query). On smaller
  databases, the performance gain might not be noticeable (or it might even be
  slightly slower for very fast queries). The cache is emptied when a sync
  runs.
+ `HYVE_ACCESS_LOGGING_ENABLED=false`: setting this to `true` enables access
  logging when `NODE_ENV=production` is set.
+ `HYVE_ACCESS_LOGFILE_PATH_OVERRIDE=`: overrides the default access logfile
  location (`logs/access.log`). Logging to a file is only enabled with
  `HYVE_ACCESS_LOGGING_ENABLED=true` and `NODE_ENV=production`. With
  `NODE_ENV=development`, hyve logs to the console instead. __Absolute path__
  __required.__

#### Web configuration

+ `VUE_APP_HYVE_TITLE=hyve`: sets the title of your installation. It is used
  throughout the whole web client, making it possible to add some personal
  flavor/branding.
+ `VUE_APP_HYVE_SUBTITLE=A Vue-based frontend for <a href="https://github.com/imtbl/hyve" target="_blank" rel="noopener">hyve</a>`:
  if not empty, sets a subtitle that is displayed on the home view. Allows the
  usage of HTML (e.g., to display links).
+ `VUE_APP_HYVE_DESCRIPTION=A Vue-based frontend for hyve`: sets the content of
  `<meta name="description">`. Be advised that the hyve web client is not
  optimized for search engines and that they might decide to ignore the
  description even if provided.
+ `VUE_APP_HYVE_ROBOTS=noindex, nofollow`: sets the content of
  `<meta name="robots">`.
+ `VUE_APP_HYVE_PRIMARY_COLOR='#3449bb'`: sets the primary color used
  throughout the hyve web client when using the light theme. Make sure to use
  a color that contrasts well with white.
+ `VUE_APP_HYVE_PRIMARY_COLOR_DARK='#500ea5'`: sets the primary color used
  throughout the hyve web client when using the dark theme. Make sure to use a
  color that contrasts well with black.
+ `VUE_APP_HYVE_USE_NORMAL_LETTER_CASE=false`: by default, the hyve web client
  uses lowercase text throughout most of the application (like hydrus client)
  for aesthestic reasons. If you do not want that, setting this to `false`
  disables these case transformations.
+ `VUE_APP_HYVE_SHOW_LOGO`: setting this to `false` disables the display of the
  hyve logo in the navigation bar.
+ `VUE_APP_HYVE_SHOW_TAG_CLOUD=false`: setting this to `true` enables the
  display of a tag cloud with the most used tags on the frontpage.
+ `VUE_APP_IPFS_GATEWAY_BASE_URL=https://ipfs.io/ipfs`: the URL to the IPFS
  gateway you want to use for IPFS links (only available when connected to
  hydrus client). __No trailing slashes.__
+ `VUE_APP_HYVE_API_URL=http://localhost:8000/api`: the URL to your hyve HTTP
  API. __No trailing slashes.__
+ `VUE_APP_HYVE_REGISTRATION_ENABLED=true`: setting this to `false` disables the
  registration page. This does not disable the registration in your hyve
  installation; to achieve this, use the appropriate server service setting.
+ `VUE_APP_HYVE_AUTHENTICATION_REQUIRED=true`: setting this to `false` allows
  the access of all views aside the user view without logging in. This only
  affects the frontend and must mirror the setting in the server service for it
  to work correctly and without creating user experience issues.
+ `VUE_APP_HYVE_MIN_PASSWORD_LENGTH=16`: sets the minimum password length when
  registering or updating the password. Providing a higher value than `1024`
  will discard the value and use `1024` as the minimum length instead. This
  is only used for frontend validation and should mirror the setting in the
  server service for the best user experience.
+ `VUE_APP_HYVE_COUNTS_ENABLED=true`: setting this to `true` enables the
  display of counts when listing files and tags. The corresponding setting in
  the server service must also be enabled if set to `true`.
+ `VUE_APP_HYVE_FALLBACK_FILES_SORTING_NAMESPACE=namespace`: sets the fallback
  sorting namespace that is needed to not break namespace sorting. Should be
  set to something sensible like `creator` or `series`, depending on your
  preferences.
+ `VUE_APP_HYVE_DEFAULT_NAMESPACE_COLORS='character#00b401|creator#bb1800|meta#676767|person#008f00|series#bb2cb9|studio#941100'`:
  sets default colors for the given namespaces. The user will not be able to
  change those colors in his settings until tags under the configured
  namespaces exist. Once such tags are added to hyve, the user will see the
  default colors and be able to override them.
+ `VUE_APP_HYVE_FALLBACK_NAMESPACE_COLOR='#0088fb'`: sets the fallback color
  for non-namespaced tags and namespaces that do not have a default set (if not
  overridden by the user).

### HTTP API

You can find the HTTP API documentation [here](API.md).

## Demo

A demo installation is located at [https://hyve.mser.at][hyve-demo].

Registration is enabled (not necessary to access the media, only to check out
the user settings), so feel free to create as many users as you would like.
__Created users are deleted at 12am CEST every day.__

If you are the creator of one or more of the media used in this demo
installation and would like to have your content removed, please
[open an issue][issues] and I will comply with your request at once.

## Screenshots

Here are some screenshots of the web client:

![Frontpage][screenshot-frontpage]

![Searching files with tags][screenshot-search]

![Files sorting options][screenshot-sorting]

![File detail page][screenshot-detail]

![Searching tags][screenshot-tags]

![Configuring settings][screenshot-settings]

![Changing user data][screenshot-user]

![Using the dark theme][screenshot-dark]

## FAQ

> I am encountering a _unique constraint_ error when syncing. Why does this
> happen?

This issue can occur when hydrus client or server is running maintenance tasks
while hyve runs a sync. In that case, it can usually easily be fixed by waiting
a few minutes and trying again. If the error persists, it might indicate issues
with your hydrus databases. If you can rule out that this is the case, please
[open an issue][issues].

> Does hyve make changes to my hydrus client/server databases?

No, hyve never makes any changes to the hydrus client/server databases, it only
reads from them.

> Why does hyve create a copy of the hydrus client/server databases instead of
> simply connecting to it or using the client API?

Some features like searching by multiple namespaces or constraints would simply
not be possible (with decent performance) without using a copy of the databases
that is optimized for hyve's purposes.

The database structure of hydrus is not built in a way that allows to deliver
paginated results that are also sorted by various criteria, which makes it not
suitable for an HTTP API that is meant to be accessed outside of a LAN. hydrus
itself does most of the sorting in code _after_ fetching the results, which is
really not an option when using pagination.

The client API has not been considered since it is still very limited and does
only feature a fraction of what hyve's API can do. It is also not available for
hydrus server, which disqualifies it regardless.

> Does hyve also make a copy of my media?

No, only a copy of the hydrus databases is made. hyve directly accesses the
hydrus media files.

> Why can I not upload files to hyve and sync them back to hydrus
> client/server?

hyve is only intended as a way to access your media files outside the
constraints of hydrus client/server. It is not meant to be yet another
booru-like software that allows you to upload and manage media. If you are
interested in something like that, I recommend you to check out popular booru
softwares like [danbooru][danbooru] or [szurubooru][szurubooru] instead.

> hydrus client/server supports _x_. Will you add this feature to hyve as well?

Maybe. If you want to see a specific feature that you think would be a good fit
for hyve, please [open an issue][issues]. In general, I prefer to add features
that are not specific to either hydrus client or hydrus server.

## Maintainer

[imtbl][maintainer]

## Contribute

You are welcome to help out!

[Open an issue][issues] or submit a pull request.

## License

[AGPLv3](LICENSE) © imtbl

[booru]: https://en.wikipedia.org/wiki/Imageboard#Danbooru-style_boards
[hydrus]: http://hydrusnetwork.github.io/hydrus
[docker]: https://www.docker.com/
[docker-hub]: https://hub.docker.com/r/mtbl/hyve/
[node-js]: https://nodejs.org/en/
[yarn]: https://yarnpkg.com/
[semantic-versioning]: https://semver.org/
[hydrus-server-help]: https://hydrusnetwork.github.io/hydrus/help/server.html
[nginx]: https://www.nginx.com/
[docker-compose]: https://docs.docker.com/compose/
[hydrus-server-docker]: https://github.com/imtbl/hydrus-server-docker
[hydrus-docker]: https://github.com/Suika/hydrus-docker
[tz-database-time-zones]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
[supported-mime-types-client]: https://github.com/imtbl/hyve/blob/master/services/sync-client/src/config/index.js#L2-L15
[supported-mime-types-server]: https://github.com/imtbl/hyve/blob/master/services/sync-server/src/config/index.js#L5-L18
[checkpoint]: https://www.sqlite.org/c3ref/wal_checkpoint.html
[hyve-demo]: https://hyve.mser.at
[danbooru]: https://github.com/r888888888/danbooru
[szurubooru]: https://github.com/rr-/szurubooru

[screenshot-frontpage]: https://github.com/imtbl/hyve/raw/master/media/screenshot-frontpage.png
[screenshot-search]: https://github.com/imtbl/hyve/raw/master/media/screenshot-search.png
[screenshot-sorting]: https://github.com/imtbl/hyve/raw/master/media/screenshot-sorting.png
[screenshot-detail]: https://github.com/imtbl/hyve/raw/master/media/screenshot-detail.png
[screenshot-tags]: https://github.com/imtbl/hyve/raw/master/media/screenshot-tags.png
[screenshot-settings]: https://github.com/imtbl/hyve/raw/master/media/screenshot-settings.png
[screenshot-user]: https://github.com/imtbl/hyve/raw/master/media/screenshot-user.png
[screenshot-dark]: https://github.com/imtbl/hyve/raw/master/media/screenshot-dark.png

[maintainer]: https://github.com/imtbl
[issues]: https://github.com/imtbl/hyve/issues/new

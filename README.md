<h1>
  <img
    src="https://github.com/mserajnik/hyve/raw/master/media/logo.png"
    alt="hyve logo"
    width="128">
  <br>
  hyve
  <a href="https://travis-ci.com/mserajnik/hyve">
    <img src="https://travis-ci.com/mserajnik/hyve.svg" alt="Build status">
  </a>
  <a href="https://hub.docker.com/r/mserajnik/hyve/">
    <img
      src="https://img.shields.io/docker/cloud/automated/mserajnik/hyve.svg"
      alt="Docker Hub build">
  </a>
  <a href="https://snyk.io/test/github/mserajnik/hyve">
    <img
      src="https://snyk.io/test/github/mserajnik/hyve/badge.svg"
      alt="Known vulnerabilities">
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

hyve does not allow you to modify or manage your hydrus media in any way, it
simply provides a way to view them.

## Table of contents

+ [Install](#install)
  + [Installing with Docker](#installing-with-docker)
  + [Installing without Docker](#installing-without-docker)
  + [Dependencies](#dependencies)
  + [Updating](#updating)
    + [Updating with Docker](#updating-with-docker)
    + [Updating without Docker](#updating-without-docker)
+ [Usage](#usage)
  + [Running with Docker](#running-with-docker)
  + [Running without Docker](#running-without-docker)
  + [Configuration](#configuration)
    + [Client sync configuration](#client-sync-configuration)
    + [Server sync configuration](#server-sync-configuration)
    + [Server configuration](#server-configuration)
    + [Web configuration](#web-configuration)
  + [HTTP API](#http-api)
+ [Screenshots](#screenshots)
+ [Donate](#donate)
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
user@local:~$ docker pull mserajnik/hyve
```

Alternatively, you can also build the image yourself. This might even be
necessary if you are on Linux and plan to mount the data via bind mount instead
of using a volume, as the user that is used inside the container has UID `1000`
and GID `1000` by default. This causes the ownership of the data on your host
machine to also being set to UID `1000` and GID `1000` (which, depending on
the distro you are running, might not be ideal).

You can make a build providing the arguments `HOST_USER_ID` and `HOST_GROUP_ID`
to change these defaults.

### Installing without Docker

To install without Docker, you can simply clone the repository and install
dependencies:

```zsh
user@local:~$ git clone https://github.com/mserajnik/hyve.git
user@local:~$ cd hyve
user@local:hyve$ yarn && yarn bootstrap
```

### Dependencies

+ [hydrus][hydrus] (either the client or the server, depending on what you want
  to connect to)
+ [Docker][docker] (when running with Docker)
+ [Node.js][node-js] (when running without Docker)
+ [Yarn][yarn] (when running without Docker)

hyve should work with both the current LTS and the latest version of Node.js.
If you encounter any issues with either of those versions when running without
Docker, please [let me know][issues].

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
user@local:~$ docker pull mserajnik/hyve
```

#### Updating without Docker

If you have installed via cloning the repository, you can update via Git:

```zsh
user@local:hyve$ git pull
user@local:hyve$ yarn && yarn bootstrap
user@local:hyve$ cd services/server
user@local:hyve/services/server$ yarn migrate
```

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
variables in the `environment` section as described [here](#configuration) and
start the containers:

```zsh
user@local:hyve$ docker-compose up -d
```

Afterwards, proceed with the hydrus server setup, upload your files and tags to
it and wait for the first sync to run. The HTTP API and the web client will be
available under the configured URLs.

If you want to connect to hydrus client instead, you can have a look at
[this][hydrus-docker] for a dockerized version of hydrus client that you should
be able to run in combination with hyve. I have included a Docker Compose
example setup only containg the hyve services
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
+ `HYVE_HYDRUS_SUPPORTED_MIME_TYPES=1,2,3,4,9,14,18,20,21,23,25,26,27`: the IDs
  of the MIME types hyve should sync from hydrus server. See
  [here][supported-mime-types-client] for the complete list of MIME types you
  can choose from.
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
+ `HYVE_HYDRUS_SUPPORTED_MIME_TYPES=1,2,3,4,9,14,18,20,21,23,25,26,27`: the IDs
  of the MIME types hyve should sync from hydrus server. See
  [here][supported-mime-types-server] for the complete list of MIME types you
  can choose from.
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
+ `VUE_APP_HYVE_SUBTITLE=A Vue-based frontend for <a href="https://github.com/mserajnik/hyve" target="_blank" rel="noopener">hyve</a>`:
  if not empty, sets a subtitle that is displayed on the home view. Allows the
  usage of HTML (e.g., to display links).
+ `VUE_APP_HYVE_DESCRIPTION=A Vue-based frontend for hyve`: sets the content of
  `<meta name="description">`. Be advised that the hyve web client is not
  optimized for search engines and that they might decide to ignore the
  description even if provided.
+ `VUE_APP_HYVE_ROBOTS=noindex, nofollow`: sets the content of
  `<meta name="robots">`.
+ `VUE_APP_HYVE_PRIMARY_COLOR='#3449bb'`: sets the primary color used
  throughout the hyve web client. Make sure to use a color that contrasts well
  with white.
+ `VUE_APP_HYVE_USE_NORMAL_LETTER_CASE=false`: by default, the hyve web client
  uses lowercase text throughout most of the application (like hydrus client)
  for aesthestic reasons. If you do not want that, setting this to `false`
  disables these case transformations.
+ `VUE_APP_HYVE_SHOW_LOGO`: setting this to false disables the display of the
  hyve logo in the navigation bar.
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
+ `VUE_APP_HYVE_DEFAULT_NAMESPACE_COLORS='character#00b401|creator#bb1800|meta#000000|person#008f00|series#bb2cb9|studio#941100'`:
  sets default colors for the given namespaces. The user will not be able to
  change those colors in his settings until tags under the configured
  namespaces exist. Once such tags are added to hyve, the user will see the
  default colors and be able to override them.
+ `VUE_APP_HYVE_FALLBACK_NAMESPACE_COLOR='#0088fb'`: sets the fallback color
  for non-namespaced tags and namespaces that do not have a default set (if not
  overridden by the user).

### HTTP API

You can find the HTTP API documentation [here](API.md).

## Screenshots

Here are some screenshots of the web client:

![Frontpage][screenshot-frontpage]

![Searching files with tags][screenshot-search]

![Files sorting options][screenshot-sorting]

![File detail page][screenshot-detail]

![Searching tags][screenshot-tags]

![Configuring settings][screenshot-settings]

![Changing user data][screenshot-user]

## Donate

If you like hyve and want to buy me a coffee, feel free to donate via PayPal:

[![Donate via PayPal][paypal-image]][paypal]

Alternatively, you can also send me BTC:

![Donate BTC][btc-image]  
`13jRyroNn8QF4mbGZxKS6mR3PsxjYTsGsu`

Donations are unnecessary, but very much appreciated. :)

## Maintainer

[mserajnik][maintainer]

## Contribute

You are welcome to help out!

[Open an issue][issues] or submit a pull request.

## License

[MIT](LICENSE.md) © Michael Serajnik

[booru]: https://en.wikipedia.org/wiki/Imageboard#Danbooru-style_boards
[hydrus]: http://hydrusnetwork.github.io/hydrus
[docker]: https://www.docker.com/
[docker-hub]: https://hub.docker.com/r/mserajnik/hyve/
[node-js]: https://nodejs.org/en/
[yarn]: https://yarnpkg.com/
[semantic-versioning]: https://semver.org/
[hydrus-server-help]: https://hydrusnetwork.github.io/hydrus/help/server.html
[nginx]: https://www.nginx.com/
[docker-compose]: https://docs.docker.com/compose/
[hydrus-server-docker]: https://github.com/mserajnik/hydrus-server-docker
[hydrus-docker]: https://github.com/Suika/hydrus-docker
[supported-mime-types-client]: https://github.com/mserajnik/hyve/blob/master/services/sync-client/src/config/index.js#L5-L17
[supported-mime-types-server]: https://github.com/mserajnik/hyve/blob/master/services/sync-server/src/config/index.js#L5-L17
[checkpoint]: https://www.sqlite.org/c3ref/wal_checkpoint.html

[screenshot-frontpage]: https://github.com/mserajnik/hyve/raw/master/media/screenshot-frontpage.png
[screenshot-search]: https://github.com/mserajnik/hyve/raw/master/media/screenshot-search.png
[screenshot-sorting]: https://github.com/mserajnik/hyve/raw/master/media/screenshot-sorting.png
[screenshot-detail]: https://github.com/mserajnik/hyve/raw/master/media/screenshot-detail.png
[screenshot-tags]: https://github.com/mserajnik/hyve/raw/master/media/screenshot-tags.png
[screenshot-settings]: https://github.com/mserajnik/hyve/raw/master/media/screenshot-settings.png
[screenshot-user]: https://github.com/mserajnik/hyve/raw/master/media/screenshot-user.png

[paypal]: https://www.paypal.me/mserajnik
[paypal-image]: https://www.paypalobjects.com/webstatic/en_US/i/btn/png/blue-rect-paypal-26px.png
[btc-image]: https://mserajnik.at/external/btc.png

[maintainer]: https://github.com/mserajnik
[issues]: https://github.com/mserajnik/hyve/issues/new

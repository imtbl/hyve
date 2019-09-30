# hyve API

## Table of contents

+ [General](#general)
+ [Authentication](#authentication)
+ [Errors](#errors)
+ [Routes](#routes)
  + [Base](#base)
  + [Users](#users)
    + [Viewing users](#viewing-users)
    + [Creating users](#creating-users)
    + [Updating users](#updating-users)
    + [Deleting users](#deleting-users)
  + [Tokens](#tokens)
    + [Listing tokens](#listing-tokens)
    + [Creating tokens](#creating-tokens)
    + [Deleting tokens](#deleting-tokens)
  + [Info](#info)
  + [Namespaces](#namespaces)
  + [MIME types](#mime-types)
  + [Tags](#tags)
    + [Listing tags](#listing-tags)
    + [Listing the most used tags](#listing-the-most-used-tags)
    + [Autocompleting tags](#autocompleting-tags)
  + [Files](#files)
    + [Listing files](#listing-files)
    + [Viewing files](#viewing-files)
  + [Media](#files)
    + [Getting media originals](#getting-media-originals)
    + [Getting media thumbnails](#getting-media-thumbnails)

## General

Request and response bodies are always in JSON format (except when sending the
actual files). Single resources (e.g., a file or an actual media file) will
return an error with status code `404` when they do not exist while lists
(e.g., of tags or files) simply return an empty array when nothing is found.

Every configuration option mentioned in this document is meant for the server,
unless stated otherwise.

## Authentication

By default, all the routes except the base route (`/<HYVE_API_BASE>`), the ones
for registering new users and creating tokens and the ones returning the actual
media files are protected with a token-based authentication. In order to access
these routes, a valid token must be provided via
`Authorization: Bearer <token>` header.

When updating or deleting users and tokens, the provided authentication token
is also used to identify which user/token(s) are to be modified/deleted.

Media files are protected with media tokens that are created alongside
authentication tokens. Such a media token must be provided as query parameter
when trying to access media files and expires alongside the authentication
token.

The requirement of (media) tokens for all non-authentication-related routes can
be disabled by setting `HYVE_AUTHENTICATION_REQUIRED` to `false`.

## Errors

When a resource is not available or an issue occurs, hyve will return one of
several possible errors which are always in the same format:

```json5
{
  "error": <error name>
}
```

hyve responds after the first error occurs so multiple errors might have to be
dealt with one after another.

## Routes

__Note:__ The routes in this documentation _do not_ have URL-encoded characters
for improved readability. Please be aware that, depending on the client you are
using, you might have to URL-encode certain characters by yourself when sending
a request.

### Base

Responds with the version number and the API version number of the hyve
installation. The API version number will increase by 1 every time an existing
API endpoint is modified in a way it behaves differently than before or
removed altogether.

__Route:__ `GET /<HYVE_API_BASE>`

__Output on success:__

```json5
{
  "hyve": {
    "version": <version number of hyve installation>,
    "apiVersion>": <API version number of hyve installation>
  }
}
```

__Possible errors:__

+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

### Users

#### Viewing users

Requires authentication. Responds with information about the user the provided
token belongs to.

__Route:__ `GET /<HYVE_API_BASE>/users`

__Output on success:__

```json5
{
  "id": <user ID>,
  "username": <username>,
  "createdAt": <ISO-8601 date representation of when the user was created>,
  "updatedAt": <ISO-8601 date representation of when the user was last updated>
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Creating users

Creates a new user. Responds with information about the created user.

__Route:__ `POST /<HYVE_API_BASE>/users`

__Input:__

```json5
{
  "username": <desired username>, // minimum length of 1 and maximum length of 1024
  "password": <desired password> // minimum length of HYVE_MIN_PASSWORD_LENGTH and maximum length of 1024
}
```

__Output on success:__

```json5
{
  "id": <user ID>,
  "username": <username>,
  "createdAt": <ISO-8601 date representation of when the user was created>,
  "updatedAt": <ISO-8601 date representation of when the user was last updated>
}
```

__Possible errors:__

+ `RegistrationDisabledError`
+ `MissingUsernameFieldError`
+ `InvalidUsernameFieldError`
+ `MissingPasswordFieldError`
+ `InvalidPasswordFieldError`
+ `UsernameExistsError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Updating users

Requires authentication. Updates the user the provided token belongs to.
Responds with information about the updated user.

__Route:__ `PUT /<HYVE_API_BASE>/users`

__Input:__

```json5
{
  "username": <new username>, // optional; at least one of the two required, minimum length of 1 and maximum length of 1024
  "password": <new password>, // optional; at least one of the two required, minimum length of HYVE_MIN_PASSWORD_LENGTH and maximum length of 1024
  "currentPassword": <current password>
}
```

__Output on success:__

```json5
{
  "id": <user ID>,
  "username": <username>,
  "createdAt": <ISO-8601 date representation of when the user was created>,
  "updatedAt": <ISO-8601 date representation of when the user was last updated>
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `NoUpdateFieldsError`
+ `MissingUsernameFieldError`
+ `InvalidUsernameFieldError`
+ `MissingPasswordFieldError`
+ `InvalidPasswordFieldError`
+ `MissingCurrentPasswordFieldError`
+ `InvalidCurrentPasswordFieldError`
+ `InvalidUserError`
+ `UsernameExistsError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Deleting users

Requires authentication. Deletes the user the provided token belongs to.

__Route:__ `DELETE /<HYVE_API_BASE>/users`

__Input:__

```json5
{
  "password": <current password>
}
```

__Output on success:__

```json5
{
  "success": true
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `MissingPasswordFieldError`
+ `InvalidPasswordFieldError`
+ `InvalidUserError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

### Tokens

#### Listing tokens

Requires authentication. Responds with a list of all non-expired tokens of the
user the provided token belongs to.

__Route:__ `GET /<HYVE_API_BASE>/tokens`

__Output on success:__

```json5
{
  "tokens": [
    {
        "token": <token>,
        "mediaToken": <media token>,
        "ip": <IP address of the client creating the token (truncated to 16 bits for privacy reasons)>,
        "userAgent": <user agent of the client creating the token>,
        "createdAt": <ISO-8601 date representation of when the token was created>,
        "expiresAt": <ISO-8601 date representation of when the token will expire>
    }
    // […]
  ]
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Creating tokens

Creates a new token for the provided user. Responds with information about the
created token.

__Route:__ `POST /<HYVE_API_BASE>/tokens`

__Input:__

```json5
{
  "username": <username>,
  "password": <password>,
  "long": true // optional; sets the token expiration time to 90 days instead of the default 1 day
}
```

__Output on success:__

```json5
{
  "token": <token>,
  "mediaToken": <media token>,
  "ip": <IP address of the client creating the token (truncated to 16 bits for privacy reasons)>,
  "userAgent": <user agent of the client creating the token>,
  "createdAt": <ISO-8601 date representation of when the token was created>,
  "expiresAt": <ISO-8601 date representation of when the token will expire>
}
```

__Possible errors:__

+ `MissingUsernameFieldError`
+ `InvalidUsernameFieldError`
+ `MissingPasswordFieldError`
+ `InvalidPasswordFieldError`
+ `InvalidLongFieldError`
+ `InvalidUserError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Deleting tokens

Requires authentication. Deletes either the provided token or all tokens of the
user the provided token belongs to.

__Route:__ `DELETE /<HYVE_API_BASE>/tokens`

__Input:__

```json5
{
  "all": true // optional; deletes all tokens of the user instead of only the one used for authentication
}
```

__Output on success:__

```json5
{
  "success": true
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `InvalidAllFieldError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

### Info

Requires authentication by default. Responds with the number of tags and files
available.

__Route:__ `GET /<HYVE_API_BASE>/info`

__Output on success:__

```json5
{
  "tagCount": <total amount of tags in the tag repository>,
  "fileCount": <total amount of files in the files repository>
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

### Namespaces

Requires authentication by default. Responds with a list of all available
namespaces.

__Route:__ `GET /<HYVE_API_BASE>/namespaces`

__Output on success:__

```json5
{
  "namespaces": [
    {
      "name": <name of the namespace>
    }
    // […]
  ]
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

### MIME types

Requires authentication by default. Responds with a list of all available MIME
types.

__Route:__ `GET /<HYVE_API_BASE>/mime-types`

__Output on success:__

```json5
{
  "mimeTypes": [
    {
      "name": <name of the MIME type>
    }
    // […]
  ]
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

### Tags

#### Listing tags

Requires authentication by default. Responds with a list of tags.

__Route:__ `GET /<HYVE_API_BASE>/tags?page=<page>&contains=<text>&sort=<method>&direction=<sort direction>`

The `contains` parameter is optional and limits the results to tags containing
the provided text.

The `sort` parameter is also optional and is used to sort the results by a
different field instead of `id` (which is the default sort method).

The available `sort` parameters are:

+ `id` (default, does not have to be provided): sorts descending by field `id`
+ `name`: sorts ascending by field `name`
+ `files`: sorts descending by field `file_count`
+ `contains`: sorts tags starting with the text provided via `contains`
  parameter and everything else ascending by field `name`
+ `random`: sorts randomly

The sort direction for most fields (except `random`) can be changed via
`direction=asc` and `direction=desc`.

__Output on success:__

```json5
{
  "tags": [
    {
      "name": <name of the tag>,
      "fileCount": <amount of files having the tag>
    }
    // […]
  ],
  "tagCount": <amount of tags for given query> // only if HYVE_COUNTS_ENABLED is set to true
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `MissingPageParameterError`
+ `InvalidPageParameterError`
+ `InvalidContainsParameterError`
+ `InvalidSortParameterError`
+ `InvalidDirectionParameterError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Listing the most used tags

Requires authentication by default. Responds with a list of the most used tags.

__Route:__ `GET /<HYVE_API_BASE>/most-used-tags`

__Output on success:__

```json5
{
  "tags": [
    {
      "name": <name of the tag>,
      "fileCount": <amount of files having the tag>
    }
    // […]
  ]
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Autocompleting tags

Requires authentication by default. Responds with a list of tags that contain
the provided partial tag.

__Route:__ `POST /<HYVE_API_BASE>/autocomplete-tag`

__Input:__

```json5
{
  "partialTag": <name of the partial tag>
}
```

__Output on success:__

```json5
{
  "tags": [
    {
      "name": <name of the tag>,
      "fileCount": <amount of files having the tag>
    }
    // […]
  ]
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `MissingPartialTagFieldError`
+ `InvalidPartialTagFieldError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

### Files

Requires authentication by default. Responds with a list of files.

#### Listing files

__Route:__ `GET /<HYVE_API_BASE>/files?page=<page>&tags[]=<tag>&constraints[]=<field><comparator><value>&sort=<method>&direction=<sort direction>&namespaces[]=<namespace>`

__Info:__

The `tags[]` parameter is optional and takes an arbitrary amount of tags (a
single tag per `tags[]`), each one (potentially) limiting the result set
further. You can also exclude files with certain tags from the results by
prefixing the tag you want to exclude with `-`, e.g., `-sky`. To prevent
confusion with tags that (for some reason) start with `-`, escape them with
`\`, e.g., `\-house` (this is not necessary for `-` that are not located at the
start of the tag).

Using wildcarded tags is also possible. To do this, add `*` at the beginning
and/or end of a tag, e.g., `*hair`. Like when excluding tags with `-`, prefix
`*` with a `\` if you want to use it as an actual character in your search,
e.g., `\*hai*r\*` (this is not necessary for `*` that are not located at the
start or end of the tag). Wildcarded tags can be excluded like normal tags (by
prefixing them with `-`).

The `constraints[]` parameter is optional and takes an arbitrary amount of
so-called _constraints_. Constraints are used to filter files by their (meta)
fields and can be used alone or in combination with tags. Like with tags, each
constraint (potentially) limits the set further.

If multiple constraints for the same field are provided, those constraints are
compared in an `OR` fashion unless there are multiple `!=` constraints for the
field, in which case those are compared with `AND` (to make it possible to
exclude multiple values for the field while at the same time
including/comparing against other values).

The syntax is the following for a single constraint:

`constraints[]=<field><comparator><value>`

Where `field` has to be one of the following:

+ `id`: the file ID
+ `hash`: the SHA-256 hash of the file
+ `ipfs`: the Base58 IPFS hash of the file
+ `size`: the file size in number of bytes
+ `width`: the width of the file
+ `height`: the height of the file
+ `mime`: the MIME type of the file
+ `tags`: the number of tags assigned to the file

`comparator` can be one of:

+ `=`: compares if the content of the field equals the given value (supported
  by all fields)
+ `!=`: compares if the content of the field does not equal the given value
  (supported by all fields)
+ `~=`: compares if the content of the field approximately equals the given
  value (not supported by `hash`, `ipfs` and `mime`)
+ `>`: compares if the content of the field is greater than the given value
  (not supported by `hash`, `ipfs` and `mime`)
+ `<`: compares if the content of the field is smaller than the given value
  (not supported by `hash`, `ipfs` and `mime`)
+ `><`: compares if the content of the field is between the two given values
  (the values are split by `,` and their order does not matter) (not supported
  by `hash`, `ipfs` and `mime`)

And `value` can be:

+ _a positive integer or `0`_: can be used for comparing with `id`, `width`,
  `height` and `tags` when using the `=`, `!=`, `~=`, `>` or `<` comparator
+ _two positive integers or `0` split with `,`_: can be used for comparing with
  `id`, `width`, `height` and `tags` when using the `><` comparator
+ _a file size_: can be used for comparing with `size` when using the `=`, `!=`,
  `~=`, `>` or `<` comparator and has to be either a positive integer (for
  _bytes_) or a positive integer or float (with `.` as decimal point) plus a
  suffix of either `k`, `m` or `g` (for _kibibytes_, _mebibytes_ and _gibibytes_
  respectively)
+ _two file sizes split with `,`_: can be used for comparing with `size` when
  using the `><` comparator (the same rules as the ones for the single file
  size apply)
+ _a SHA-256 digest_: can be used for comparing with `hash`
+ _a Base58 IPFS hash_: can be used for comparing with `ipfs`
+ _a MIME type in the common `<type>/<subtype>` syntax_: can be used for
  comparing with `mime`

Some examples could be:

+ `constraints[]=id!=42`
+ `constraints[]=id=84&constraints[]=id=126`
+ `constraints[]=hash=ed2c48b9f65f76f140b582b33e5415abe2037e43677952074b9158e6b5979ef4`
+ `constraints[]=size>5m`
+ `constraints[]=size><500k,2m`
+ `constraints[]=width>1000`
+ `constraints[]=height><500,1000`
+ `constraints[]=mime=image/png`
+ `constraints[]=tags<5`
+ `constraints[]=mime=image/png&constraints[]=size<5m&constraints[]=height>1000&constraints[]=tags>15`

Finally, the `sort` parameter is also optional and is used to sort the results
by a different field instead of `id` (which is the default sort method).

The available `sort` parameters are:

+ `id` (default, does not have to be provided): sorts descending by field `id`
+ `size`: sorts descending by field `size`
+ `width`: sorts descending by field `width`
+ `height`: sorts descending by field `height`
+ `mime`: sorts ascending by field `mime`
+ `tags`: sorts descending by field `tag_count`
+ `namespaces`: sorts ascending by provided namespaces first and descending by
  field `id` second
+ `random`: sorts randomly

The sort direction for most fields (except `random`) can be changed via
`direction=asc` and `direction=desc`.

If `sort=namespaces` is set, at least one namespace must be provided via
`namespaces[]=<namespace>`. This then sorts the results  by that namespace
(e.g., files with tag `creator:a` come before `creator:b` if sorted by
`creator` and the default direction).

Providing multiple namespaces to sort by is possible, the order in which they
are provided then defines the "sub sorting". E.g.,
`sort=namespace&namespaces[]=<namespaceA>&namespaces[]=<namespaceB>&namespaces[]=<namespaceC>`
causes files to be sorted by `namespaceA`, then `namespaceB`, then
`namespaceC`.

Files not having one or more of the given sort namespaces are _not_ omitted
from the results but will be sorted descending by `id` to the end of the (sub)
set.

This route returns the same data for each file as when
[viewing a file](#viewing-files) but omits the tags to reduce the response size
when dealing with possible cases where many files that each have many tags are
displayed on a single page.

__Output on success:__

```json5
{
  "files": [
    {
      "id": <file ID>,
      "hash": <file hash (SHA-256)>,
      "ipfsHash": <IPFS hash (if available)>,
      "mime": <MIME type>,
      "size": <file size in bytes>,
      "width": <width in pixel>,
      "height": <height in pixel>,
      "tagCount": <amount of tags>,
      "mediaUrl": <original media URL>,
      "thumbnailUrl": <thumbnail URL>
    }
    // […]
  ],
  "fileCount": <amount of files for given query> // only if HYVE_COUNTS_ENABLED is set to true
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `MissingPageParameterError`
+ `InvalidPageParameterError`
+ `InvalidTagsParameterError`
+ `InvalidConstraintsParameterError`
+ `InvalidSortParameterError`
+ `InvalidDirectionParameterError`
+ `MissingNamespacesParameterError`
+ `InvalidNamespacesParameterError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Viewing files

Requires authentication by default. Responds with information about the file
the provided ID belongs to.

__Route:__ `GET /<HYVE_API_BASE>/files/<file id>`

__Info:__

This route returns the same data as when [listing files](#listing-files) but
also includes the tags of the file.

__Output on success:__

```json5
{
  "id": <file ID>,
  "hash": <file hash (SHA-256)>,
  "ipfsHash": <IPFS hash (if available)>,
  "mime": <MIME type>,
  "size": <file size in bytes>,
  "width": <width in pixel>,
  "height": <height in pixel>,
  "tagCount": <amount of tags>,
  "mediaUrl": <original media URL>,
  "thumbnailUrl": <thumbnail URL>,
  "tags": [
    {
      "name": <name of the tag>,
      "files": <amount of files having the tag>
    }
    // […]
  ]
}
```

__Possible errors:__

+ `MissingTokenError`
+ `InvalidTokenError`
+ `MissingIdParameterError`
+ `InvalidIdParameterError`
+ `NotFoundError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

### Media

#### Getting media originals

Requires authentication by default. Responds with the requested media original.

__Route:__ `GET /<MEDIA_BASE>/originals/<media hash>?token=<media token>`

__Info:__

The `token` parameter is optional, when `HYVE_AUTHENTICATION_REQUIRED` is set
to `false`.

__Output on success:__ The requested media file

__Possible errors:__

+ `MissingMediaTokenError`
+ `InvalidMediaTokenError`
+ `MissingMediaHashParameterError`
+ `InvalidMediaHashParameterError`
+ `NotFoundError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

#### Getting media thumbnails

Requires authentication by default. Responds with the requested media
thumbnail.

__Route:__ `GET /<MEDIA_BASE>/thumbnails/<media hash>?token=<media token>`

__Info:__

The `token` parameter is optional, when `HYVE_AUTHENTICATION_REQUIRED` is set
to `false`.

__Output on success:__ The requested media thumbnail

__Possible errors:__

+ `MissingMediaTokenError`
+ `InvalidMediaTokenError`
+ `MissingMediaHashParameterError`
+ `InvalidMediaHashParameterError`
+ `NotFoundError`
+ `SyncInProgressError`
+ `ShuttingDownError`
+ `InternalServerError`

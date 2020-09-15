const path = require('path')

let authenticationDbPath = process.env.HYVE_AUTHENTICATION_DB_PATH

if (authenticationDbPath.startsWith('.')) {
  authenticationDbPath = path.resolve(__dirname, '../..', authenticationDbPath)
}

let contentDbPath = process.env.HYVE_CONTENT_DB_PATH

if (contentDbPath.startsWith('.')) {
  contentDbPath = path.resolve(__dirname, '../..', contentDbPath)
}

module.exports = {
  version: '3.2.0',
  apiVersion: 1,
  url: process.env.HYVE_URL,
  port: process.env.HYVE_PORT || 8000,
  apiBase: process.env.HYVE_API_BASE || '/api',
  mediaBase: process.env.HYVE_MEDIA_BASE || '/media',
  crossOriginIsAllowed: process.env.HYVE_CROSS_ORIGIN_ALLOWED === 'true',
  authenticationDbPath: authenticationDbPath,
  contentDbPath: contentDbPath,
  hydrusFilesPath: process.env.HYVE_HYDRUS_FILES_PATH,
  hydrusThumbnailsPath: process.env.HYVE_HYDRUS_THUMBNAILS_PATH
    || process.env.HYVE_HYDRUS_FILES_PATH,
  hydrusFilesMode:
    ['client', 'server'].includes(process.env.HYVE_HYDRUS_FILES_MODE)
      ? process.env.HYVE_HYDRUS_FILES_MODE
      : 'server',
  numberOfWorkers:
    process.env.HYVE_NUMBER_OF_WORKERS || require('os').cpus().length,
  dbCheckpointInterval: process.env.HYVE_DB_CHECKPOINT_INTERVAL || 3600,
  registrationIsEnabled: (process.env.HYVE_REGISTRATION_ENABLED === 'true'),
  authenticationIsRequired: process.env.HYVE_AUTHENTICATION_REQUIRED
    ? process.env.HYVE_AUTHENTICATION_REQUIRED === 'true'
    : true,
  minPasswordLength: process.env.HYVE_MIN_PASSWORD_LENGTH || 16,
  filesPerPage: process.env.HYVE_FILES_PER_PAGE || 42,
  tagsPerPage: process.env.HYVE_TAGS_PER_PAGE || 42,
  mostUsedTagsLimit: process.env.HYVE_MOST_USED_TAGS_LIMIT || 20,
  autocompleteLimit: process.env.HYVE_AUTOCOMPLETE_LIMIT || 10,
  countsAreEnabled: process.env.HYVE_COUNTS_ENABLED === 'true',
  countsCachingIsEnabled: process.env.HYVE_COUNTS_CACHING_ENABLED === 'true',
  accessLoggingIsEnabled: process.env.HYVE_ACCESS_LOGGING_ENABLED === 'true',
  accessLogfilePath: process.env.HYVE_ACCESS_LOGFILE_PATH_OVERRIDE ||
    path.resolve(__dirname, '../../logs/access.log'),
  availableMimeTypes: {
    1: 'image/jpeg',
    2: 'image/png',
    3: 'image/gif',
    4: 'image/bmp',
    9: 'video/x-flv',
    14: 'video/mp4',
    18: 'video/x-ms-wmv',
    20: 'video/x-matroska',
    21: 'video/webm',
    23: 'image/apng',
    25: 'video/mpeg',
    26: 'video/quicktime',
    27: 'video/x-msvideo',
    33: 'image/webp'
  }
}

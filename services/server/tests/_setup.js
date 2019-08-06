const path = require('path')

module.exports = {
  setTestEnvironment () {
    process.env.NODE_ENV = 'test'
    process.env.HYVE_URL = 'http://localhost'
    process.env.HYVE_AUTHENTICATION_DB_PATH = path.resolve(
      __dirname, 'storage/authentication.db'
    )
    process.env.HYVE_CONTENT_DB_PATH = path.resolve(
      __dirname, 'storage/content.db'
    )
    process.env.HYVE_HYDRUS_FILES_PATH = path.resolve(
      __dirname, 'hydrus-server-dummy/server_files'
    )
    process.env.HYVE_FILES_PER_PAGE = 4
    process.env.HYVE_TAGS_PER_PAGE = 4
  }
}

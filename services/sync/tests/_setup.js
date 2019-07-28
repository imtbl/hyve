const path = require('path')

module.exports = {
  setTestEnvironment () {
    process.env.NODE_ENV = 'test'
    process.env.HYVE_CONTENT_DB_PATH = path.resolve(
      __dirname, 'storage/content.db'
    )
    process.env.HYVE_HYDRUS_SERVER_DB_PATH = path.resolve(
      __dirname, 'hydrus-server-dummy/server.db'
    )
    process.env.HYVE_HYDRUS_MASTER_DB_PATH = path.resolve(
      __dirname, 'hydrus-server-dummy/server.master.db'
    )
    process.env.HYVE_HYDRUS_MAPPINGS_DB_PATH = path.resolve(
      __dirname, 'hydrus-server-dummy/server.mappings.db'
    )
    process.env.HYVE_HYDRUS_TAG_REPOSITORY = 2
    process.env.HYVE_HYDRUS_FILE_REPOSITORY = 3
    process.env.HYVE_HYDRUS_SUPPORTED_MIME_TYPES = '1,2,3,4,14,21,23'
  }
}

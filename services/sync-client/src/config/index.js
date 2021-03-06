const availableMimeTypes = {
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

module.exports = {
  contentDbPath: process.env.HYVE_CONTENT_DB_PATH,
  hydrusClientDbPath: process.env.HYVE_HYDRUS_CLIENT_DB_PATH,
  hydrusMasterDbPath: process.env.HYVE_HYDRUS_MASTER_DB_PATH,
  hydrusMappingsDbPath: process.env.HYVE_HYDRUS_MAPPINGS_DB_PATH,
  hydrusCachesDbPath: process.env.HYVE_HYDRUS_CACHES_DB_PATH,
  hydrusTagService: process.env.HYVE_HYDRUS_TAG_SERVICE,
  hydrusFileService: process.env.HYVE_HYDRUS_FILE_SERVICE,
  hydrusTableServices: 'hydrus_client_db.services',
  hydrusTableCurrentFiles: 'hydrus_client_db.current_files',
  hydrusTableFileInbox: 'hydrus_client_db.file_inbox',
  hydrusTableFilesInfo: 'hydrus_client_db.files_info',
  hydrusTableServiceFilenames: 'hydrus_client_db.service_filenames',
  hydrusTableTags: 'hydrus_master_db.tags',
  hydrusTableNamespaces: 'hydrus_master_db.namespaces',
  hydrusTableHashes: 'hydrus_master_db.hashes',
  hydrusTableCurrentMappings: 'hydrus_mappings_db.current_mappings',
  hydrusTableLocalTagsCache: 'hydrus_caches_db.local_tags_cache',
  includeInbox: process.env.HYVE_HYDRUS_INCLUDE_INBOX === 'true',
  supportedMimeTypes: process.env.HYVE_HYDRUS_SUPPORTED_MIME_TYPES
    .split(',')
    .filter(mimeType => (parseInt(mimeType) in availableMimeTypes)),
  excludedTags: process.env.HYVE_HYDRUS_EXCLUDED_TAGS &&
    process.env.HYVE_HYDRUS_EXCLUDED_TAGS.trim() !== ''
    ? process.env.HYVE_HYDRUS_EXCLUDED_TAGS.split('###').map(
        tag => tag.trim()
      )
    : []
}

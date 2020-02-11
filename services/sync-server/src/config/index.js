const hydrusTagRepository = process.env.HYVE_HYDRUS_TAG_REPOSITORY
const hydrusFileRepository = process.env.HYVE_HYDRUS_FILE_REPOSITORY

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
  hydrusServerDbPath: process.env.HYVE_HYDRUS_SERVER_DB_PATH,
  hydrusMasterDbPath: process.env.HYVE_HYDRUS_MASTER_DB_PATH,
  hydrusMappingsDbPath: process.env.HYVE_HYDRUS_MAPPINGS_DB_PATH,
  hydrusTableCurrentFiles:
    `hydrus_server_db.current_files_${hydrusFileRepository}`,
  hydrusTableFilesInfo: 'hydrus_server_db.files_info',
  hydrusTableTags: 'hydrus_master_db.tags',
  hydrusTableHashes: 'hydrus_master_db.hashes',
  hydrusTableCurrentMappings:
    `hydrus_mappings_db.current_mappings_${hydrusTagRepository}`,
  hydrusTableRepositoryTagIdMap:
    `hydrus_master_db.repository_tag_id_map_${hydrusTagRepository}`,
  hydrusTableRepositoryHashIdMapTags:
    `hydrus_master_db.repository_hash_id_map_${hydrusTagRepository}`,
  hydrusTableRepositoryHashIdMapFiles:
    `hydrus_master_db.repository_hash_id_map_${hydrusFileRepository}`,
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

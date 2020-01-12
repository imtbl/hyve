const config = require('../config')
const db = require('../db')
const profiler = require('../util/profiler')

let namespaces

function run () {
  profiler.init()

  profiler.log('{datetime}: Running sync…\n\n')

  db.connect()

  createTables(true)
  profiler.log('Create initial tables (if necessary): {dt}\n')

  dropZombieTables()
  profiler.log('Drop zombie tables: {dt}\n')

  db.attachHydrusDatabases()
  profiler.log('Attach hydrus databases: {dt}\n')

  namespaces = getNamespaces()
  profiler.log('Get namespaces: {dt}\n')

  createTables(false, namespaces)
  profiler.log('Create new tables: {dt}\n')

  fillNewNamespacesTable(namespaces)
  profiler.log('Fill new namespaces table: {dt}\n')

  fillNewTagsTable()
  profiler.log('Fill new tags table: {dt}\n')

  fillNewFilesTable(namespaces)
  profiler.log('Fill new files table: {dt}\n')

  fillNewMappingsTable()
  profiler.log('Fill new mappings table: {dt}\n')

  if (config.excludedTags.length) {
    removeExcludedFiles()
    profiler.log('Remove excluded files: {dt}\n')
  }

  fillNewMimeTypesTable()
  profiler.log('Fill new MIME types table: {dt}\n')

  updateTagCountsOnNewFilesTables()
  profiler.log('Update tag counts on new files table: {dt}\n')

  db.detachHydrusDatabases()
  profiler.log('Detach hydrus databases: {dt}\n')

  replaceCurrentTables()
  profiler.log('Replace current tables: {dt}\n')

  cleanUp()
  profiler.log('Clean up: {dt}\n')

  profiler.log('Total: {t}\n\n')

  console.info(getTotals())

  db.close()
}

function abort () {
  process.nextTick(() => {
    db.close()
  })
}

function createTables (initial = true) {
  const suffix = initial ? '' : '_new'

  db.hyve.prepare(
    `CREATE TABLE IF NOT EXISTS namespaces${suffix} (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
      name TEXT NOT NULL UNIQUE
    )`
  ).run()

  db.hyve.prepare(
    `CREATE TABLE IF NOT EXISTS tags${suffix} (
      id INTEGER NOT NULL PRIMARY KEY UNIQUE,
      name TEXT NOT NULL UNIQUE,
      file_count INTEGER NOT NULL,
      random TEXT NOT NULL
    )`
  ).run()

  const namespaceColumns = []

  if (Array.isArray(namespaces)) {
    for (const namespace of namespaces) {
      namespaceColumns.push(
        `namespace_${namespace.split(' ').join('_')} TEXT`
      )
    }
  }

  db.hyve.prepare(
    `CREATE TABLE IF NOT EXISTS files${suffix} (
      id INTEGER NOT NULL PRIMARY KEY UNIQUE,
      tags_id INTEGER UNIQUE DEFAULT NULL,
      hash TEXT UNIQUE NOT NULL,
      ipfs_hash TEXT UNIQUE DEFAULT NULL,
      mime INTEGER NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      tag_count INTEGER NOT NULL DEFAULT 0,
      random TEXT NOT NULL
      ${namespaceColumns.length ? ',' + namespaceColumns.join(',') : ''}
    )`
  ).run()

  db.hyve.prepare(
    `CREATE TABLE IF NOT EXISTS mappings${suffix} (
      file_tags_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      FOREIGN KEY(file_tags_id) REFERENCES files${suffix}(tags_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags${suffix}(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    )`
  ).run()

  db.hyve.prepare(
    `CREATE TABLE IF NOT EXISTS mime_types${suffix} (
      id INTEGER UNIQUE NOT NULL PRIMARY KEY
    )`
  ).run()

  db.hyve.prepare(
    `CREATE TABLE IF NOT EXISTS tag_counts${suffix} (
      hash TEXT UNIQUE NOT NULL PRIMARY KEY,
      count INTEGER NOT NULL
    )`
  ).run()

  db.hyve.prepare(
    `CREATE TABLE IF NOT EXISTS file_counts${suffix} (
      hash TEXT UNIQUE NOT NULL PRIMARY KEY,
      count INTEGER NOT NULL
    )`
  ).run()
}

function dropZombieTables () {
  db.hyve.prepare('DROP TABLE IF EXISTS namespaces_new').run()
  db.hyve.prepare('DROP TABLE IF EXISTS mappings_new').run()
  db.hyve.prepare('DROP TABLE IF EXISTS tags_new').run()
  db.hyve.prepare('DROP TABLE IF EXISTS files_new').run()
  db.hyve.prepare('DROP TABLE IF EXISTS mime_types_new').run()
  db.hyve.prepare('DROP TABLE IF EXISTS tag_counts_new').run()
  db.hyve.prepare('DROP TABLE IF EXISTS file_counts_new').run()
}

function getNamespaces () {
  return db.hyve.prepare(
    `SELECT name FROM (
      SELECT DISTINCT SUBSTR(
        ${config.hydrusTableTags}.tag,
        0,
        INSTR(${config.hydrusTableTags}.tag, ':')
      ) AS name
      FROM
        ${config.hydrusTableCurrentMappings}
      NATURAL JOIN
        ${config.hydrusTableRepositoryTagIdMap}
      NATURAL JOIN
        ${config.hydrusTableTags}
      NATURAL JOIN
        ${config.hydrusTableRepositoryHashIdMapTags}
      NATURAL JOIN
        ${config.hydrusTableFilesInfo}
      INNER JOIN
        ${config.hydrusTableRepositoryHashIdMapFiles}
        ON ${config.hydrusTableRepositoryHashIdMapFiles}.master_hash_id =
          ${config.hydrusTableFilesInfo}.master_hash_id
      INNER JOIN
        ${config.hydrusTableCurrentFiles}
        ON ${config.hydrusTableCurrentFiles}.service_hash_id =
          ${config.hydrusTableRepositoryHashIdMapFiles}.service_hash_id
      WHERE
        ${config.hydrusTableTags}.tag LIKE '%_:_%'
      AND
        ${config.hydrusTableFilesInfo}.mime IN (
          ${config.supportedMimeTypes}
        )
    )
    WHERE
      name REGEXP '^[a-zA-Z0-9_]+$'
    ORDER BY
      name`
  ).pluck().all()
}

function fillNewNamespacesTable () {
  for (const namespace of namespaces) {
    db.hyve.prepare(
      'INSERT INTO namespaces_new (name) VALUES (?)'
    ).run(namespace)
  }
}

function fillNewTagsTable () {
  db.hyve.prepare(
    `INSERT INTO tags_new
      SELECT
        ${config.hydrusTableCurrentMappings}.service_tag_id,
        ${config.hydrusTableTags}.tag,
        COUNT(*),
        SUBSTR(''||RANDOM(), -4)
      FROM
        ${config.hydrusTableCurrentMappings}
      NATURAL JOIN
        ${config.hydrusTableRepositoryTagIdMap}
      NATURAL JOIN
        ${config.hydrusTableTags}
      NATURAL JOIN
        ${config.hydrusTableRepositoryHashIdMapTags}
      NATURAL JOIN
        ${config.hydrusTableFilesInfo}
      INNER JOIN
        ${config.hydrusTableRepositoryHashIdMapFiles}
        ON ${config.hydrusTableRepositoryHashIdMapFiles}.master_hash_id =
          ${config.hydrusTableFilesInfo}.master_hash_id
      INNER JOIN
        ${config.hydrusTableCurrentFiles}
        ON ${config.hydrusTableCurrentFiles}.service_hash_id =
          ${config.hydrusTableRepositoryHashIdMapFiles}.service_hash_id
      WHERE
        ${config.hydrusTableFilesInfo}.mime IN (
          ${config.supportedMimeTypes}
        )
      GROUP BY
        ${config.hydrusTableTags}.tag`
  ).run()
}

function fillNewFilesTable () {
  const namespaceColumns = []

  for (const namespace of namespaces) {
    namespaceColumns.push(
      `namespace_${namespace.split(' ').join('_')}`
    )
  }

  db.hyve.prepare(
    `INSERT INTO files_new (
      id,
      tags_id,
      hash,
      mime,
      size,
      width,
      height,
      random
      ${namespaceColumns.length ? ',' + namespaceColumns.join(',') : ''}
    )
      SELECT
        ${config.hydrusTableCurrentFiles}.service_hash_id,
        ${config.hydrusTableRepositoryHashIdMapTags}.service_hash_id,
        LOWER(HEX(${config.hydrusTableHashes}.hash)),
        ${config.hydrusTableFilesInfo}.mime,
        ${config.hydrusTableFilesInfo}.size,
        ${config.hydrusTableFilesInfo}.width,
        ${config.hydrusTableFilesInfo}.height,
        SUBSTR(''||random(), -4)
        ${namespaceColumns.length ? ', null AS ' + namespaceColumns.join(', null AS ') : ''}
      FROM
        ${config.hydrusTableHashes}
      NATURAL JOIN
        ${config.hydrusTableFilesInfo}
      NATURAL JOIN
        ${config.hydrusTableRepositoryHashIdMapFiles}
      LEFT JOIN
        ${config.hydrusTableRepositoryHashIdMapTags}
        ON ${config.hydrusTableRepositoryHashIdMapTags}.master_hash_id =
          ${config.hydrusTableHashes}.master_hash_id
      NATURAL JOIN
        ${config.hydrusTableCurrentFiles}
      WHERE
        ${config.hydrusTableFilesInfo}.mime IN (
          ${config.supportedMimeTypes}
        )`
  ).run()

  db.hyve.prepare(
    `CREATE TEMP TABLE temp_namespaces_reduced AS
      SELECT
        master_tag_id, tag
      FROM
        ${config.hydrusTableTags}
      WHERE
        tag LIKE '%_:_%'`
  ).run()

  const selectStatement = db.hyve.prepare(
    `SELECT
      REPLACE(temp_namespaces_reduced.tag, :namespace, '') AS tag,
      ${config.hydrusTableRepositoryHashIdMapTags}.service_hash_id AS tags_id
    FROM
      ${config.hydrusTableCurrentMappings}
    NATURAL JOIN
      ${config.hydrusTableRepositoryTagIdMap}
    NATURAL JOIN
      temp_namespaces_reduced
    NATURAL JOIN
      ${config.hydrusTableRepositoryHashIdMapTags}
    WHERE
      temp_namespaces_reduced.tag LIKE :namespace || '_%'
    GROUP BY
      tags_id`
  )

  const updateStatements = []

  namespaces.map((namespace, i) => {
    updateStatements[namespaces[i]] = db.hyve.prepare(
      `UPDATE
        files_new
      SET
        namespace_${namespace.replace(' ', '_')} = :tag
      WHERE
        tags_id = :tags_id`
    )
  })

  db.hyve.transaction(namespaces => {
    for (const namespace of namespaces) {
      const tags = selectStatement.all({
        namespace: `${namespace}:`
      })

      db.hyve.transaction(tags => {
        for (const tag of tags) {
          updateStatements[namespace].run(tag)
        }
      })(tags)
    }
  })(namespaces)

  db.hyve.prepare('DROP TABLE temp_namespaces_reduced').run()
}

function fillNewMappingsTable () {
  db.hyve.prepare(
    `INSERT INTO mappings_new
      SELECT
        ${config.hydrusTableCurrentMappings}.service_hash_id,
        ${config.hydrusTableCurrentMappings}.service_tag_id
      FROM
        ${config.hydrusTableCurrentMappings}
      NATURAL JOIN
        ${config.hydrusTableRepositoryHashIdMapTags}
      NATURAL JOIN
        ${config.hydrusTableFilesInfo}
      INNER JOIN
        ${config.hydrusTableRepositoryHashIdMapFiles}
        ON ${config.hydrusTableRepositoryHashIdMapFiles}.master_hash_id =
          ${config.hydrusTableFilesInfo}.master_hash_id
      INNER JOIN
        ${config.hydrusTableCurrentFiles}
        ON ${config.hydrusTableCurrentFiles}.service_hash_id =
          ${config.hydrusTableRepositoryHashIdMapFiles}.service_hash_id
      WHERE
        ${config.hydrusTableFilesInfo}.mime IN (
          ${config.supportedMimeTypes}
        )`
  ).run()
}

function removeExcludedFiles () {
  const tags = [...new Set(config.excludedTags)]

  db.hyve.prepare(
    `DELETE
    FROM
      files_new
    WHERE
      files_new.tags_id IN (
        SELECT file_tags_id FROM mappings_new WHERE tag_id IN (
          SELECT id FROM tags_new
          WHERE name IN (${',?'.repeat(tags.length).replace(',', '')})
        )
        GROUP BY file_tags_id
      )`
  ).run(tags)

  db.hyve.prepare(
    `DELETE
    FROM
      tags_new
    WHERE
      id IN (
        SELECT
          id
        FROM
          tags_new
        LEFT JOIN
          mappings_new
          ON
            mappings_new.tag_id = tags_new.id
        WHERE
          mappings_new.tag_id IS NULL
      )`
  ).run()
}

function fillNewMimeTypesTable () {
  db.hyve.prepare(
    `INSERT INTO mime_types_new
      SELECT DISTINCT
        mime
      FROM
        files_new`
  ).run()
}

function updateTagCountsOnNewFilesTables () {
  db.hyve.prepare(
    `CREATE INDEX
      temp_idx_mappings_file_tags_id
    ON
      mappings_new(file_tags_id)`
  ).run()

  db.hyve.prepare(
    `UPDATE
      files_new
    SET
      tag_count = (
        SELECT
          COUNT(*)
        FROM
          mappings_new
        WHERE
          mappings_new.file_tags_id = files_new.tags_id
      )`
  ).run()

  db.hyve.prepare('DROP INDEX temp_idx_mappings_file_tags_id').run()
}

function replaceCurrentTables () {
  db.hyve.prepare('DROP TABLE IF EXISTS namespaces').run()
  db.hyve.prepare('DROP TABLE IF EXISTS mappings').run()
  db.hyve.prepare('DROP TABLE IF EXISTS tags').run()
  db.hyve.prepare('DROP TABLE IF EXISTS files').run()
  db.hyve.prepare('DROP TABLE IF EXISTS mime_types').run()
  db.hyve.prepare('DROP TABLE IF EXISTS tag_counts').run()
  db.hyve.prepare('DROP TABLE IF EXISTS file_counts').run()

  db.hyve.prepare('ALTER TABLE namespaces_new RENAME TO namespaces').run()
  db.hyve.prepare('ALTER TABLE tags_new RENAME TO tags').run()
  db.hyve.prepare('ALTER TABLE files_new RENAME TO files').run()
  db.hyve.prepare('ALTER TABLE mappings_new RENAME TO mappings').run()
  db.hyve.prepare('ALTER TABLE mime_types_new RENAME TO mime_types').run()
  db.hyve.prepare('ALTER TABLE tag_counts_new RENAME TO tag_counts').run()
  db.hyve.prepare('ALTER TABLE file_counts_new RENAME TO file_counts').run()

  db.hyve.prepare(
    'CREATE INDEX idx_mappings_file_tags_id ON mappings(file_tags_id)'
  ).run()
  db.hyve.prepare(
    'CREATE INDEX idx_mappings_tag_id ON mappings(tag_id)'
  ).run()
}

function getTotals () {
  const namespaceCount = db.hyve.prepare(
    'SELECT COUNT(*) FROM namespaces'
  ).pluck().get()
  const tagCount = db.hyve.prepare(
    'SELECT COUNT(*) FROM tags'
  ).pluck().get()
  const fileCount = db.hyve.prepare(
    'SELECT COUNT(*) FROM files'
  ).pluck().get()
  const mappingCount = db.hyve.prepare(
    'SELECT COUNT(*) FROM mappings'
  ).pluck().get()

  return `Namespaces: ${namespaceCount}, ` +
    `Tags: ${tagCount}, ` +
    `Files: ${fileCount}, ` +
    `Mappings: ${mappingCount}`
}

function cleanUp () {
  try {
    db.hyve.prepare('VACUUM').run()
    db.hyve.pragma('wal_checkpoint(TRUNCATE)')
  } catch (err) {
    console.info(
      'Could not clean up after succesful sync, will try again on the ' +
        'next run.'
    )
  }
}

module.exports = {
  run,
  abort
}

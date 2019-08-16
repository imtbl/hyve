const objectHash = require('object-hash')

const db = require('../db')
const config = require('../config')
const queryHelper = require('../util/query')

module.exports = {
  get (page, sort = 'id', direction = null) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction)

    data.tags = db.content.prepare(
      `SELECT
        name,
        file_count AS fileCount
      FROM
        tags
      ORDER BY
        ${orderBy.method}
      LIMIT
        ${config.tagsPerPage}
      OFFSET
        ${(page - 1) * config.tagsPerPage}`
    ).all(...orderBy.params)

    if (config.countsAreEnabled) {
      let tagCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          contains: ''
        })

        tagCount = this.getCachedCount(hash)
      }

      if (!tagCount) {
        tagCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            tags`
        ).pluck().get()

        this.addCachedCount(hash, tagCount)
      }

      data.tagCount = tagCount
    }

    return data
  },
  getContaining (page, contains, sort = 'id', direction = null) {
    const data = {}

    contains = queryHelper.escapeSpecialCharacters(contains)

    const orderBy = this.generateOrderBy(sort, direction, contains)

    data.tags = db.content.prepare(
      `SELECT
        name,
        file_count AS fileCount
      FROM
        tags
      WHERE
        name LIKE ? ESCAPE '^'
      ORDER BY
        ${orderBy.method}
      LIMIT
        ${config.tagsPerPage}
      OFFSET
        ${(page - 1) * config.tagsPerPage}`
    ).all(`%${contains}%`, ...orderBy.params)

    if (config.countsAreEnabled) {
      let tagCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          contains: contains
        })

        tagCount = this.getCachedCount(hash)
      }

      if (!tagCount) {
        tagCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            tags
          WHERE
            name LIKE ? ESCAPE '^'`
        ).pluck().get(`%${contains}%`)

        this.addCachedCount(hash, tagCount)
      }

      data.tagCount = tagCount
    }

    return data
  },
  getOfFile (fileId) {
    return db.content.prepare(
      `SELECT
        tags.name,
        tags.file_count AS fileCount
      FROM
        files
      LEFT JOIN
        mappings
        ON
          mappings.file_tags_id = files.tags_id
      LEFT JOIN
        tags
        ON
          tags.id = mappings.tag_id
      WHERE
        files.id = ?
      ORDER BY
        tags.name`
    ).all(fileId).filter(row => row.name && row.fileCount)
  },
  complete (partialTag) {
    partialTag = queryHelper.escapeSpecialCharacters(partialTag)

    return db.content.prepare(
      `SELECT
        name,
        file_count AS fileCount
      FROM
        tags
      WHERE
        name LIKE ? ESCAPE '^'
      ORDER BY
        CASE
          WHEN name LIKE ? ESCAPE '^' THEN 0
          ELSE 1
        END,
        file_count DESC
      LIMIT
        ${config.autocompleteLimit}`
    ).all(`%${partialTag}%`, `${partialTag}`)
  },
  getNamespaces () {
    return db.content.prepare(
      'SELECT name FROM namespaces ORDER BY name'
    ).all()
  },
  getTotalCount () {
    return db.content.prepare(
      'SELECT COUNT(*) FROM tags'
    ).pluck().get()
  },
  generateOrderBy (sort, direction, contains = null) {
    direction = ['asc', 'desc'].includes(direction) ? direction : null

    if (sort === 'contains' && contains) {
      return {
        method: `
          CASE
            WHEN name LIKE ? ESCAPE '^' THEN 0
            ELSE 1
          END,
          name ${direction || 'ASC'}
        `,
        params: [`${contains}%`]
      }
    }

    switch (sort) {
      case 'name':
      case 'contains':
        return {
          method: `name ${direction || 'ASC'}`,
          params: []
        }
      case 'files':
        return {
          method: `file_count ${direction || 'DESC'}`,
          params: []
        }
      case 'random':
        return {
          method: 'random ASC',
          params: []
        }
      default:
        return {
          method: `id ${direction || 'DESC'}`,
          params: []
        }
    }
  },
  getCachedCount (hash) {
    return db.content.prepare(
      `SELECT
        count
      FROM
        tag_counts
      WHERE
        hash = ?`
    ).pluck().get(hash)
  },
  addCachedCount (hash, tagCount) {
    if (!config.countsCachingIsEnabled) {
      return
    }

    db.content.prepare(
      'INSERT OR IGNORE INTO tag_counts (hash, count) VALUES (?, ?)'
    ).run(hash, tagCount)
  }
}

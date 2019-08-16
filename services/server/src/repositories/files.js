const objectHash = require('object-hash')

const db = require('../db')
const config = require('../config')
const tagsRepository = require('./tags')
const queryHelper = require('../util/query')
const constraintsHelper = require('../util/constraints')

module.exports = {
  getById (id) {
    const file = db.content.prepare(
      `SELECT
        id,
        hash,
        mime,
        size,
        width,
        height,
        tag_count AS tagCount
      FROM
        files
      WHERE
        id = ?`
    ).get(id)

    return this.prepareFile(file)
  },
  get (page, sort = 'id', direction = null, namespaces = []) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction, namespaces)

    if (!orderBy) {
      return this.get(page)
    }

    data.files = db.content.prepare(
      `SELECT
        id,
        hash,
        mime,
        size,
        width,
        height,
        tag_count AS tagCount
      FROM
        files
      ORDER BY
        ${orderBy}
      LIMIT
        ${config.filesPerPage}
      OFFSET
        ${(page - 1) * config.filesPerPage}`
    ).all().map(file => this.prepareFile(file))

    if (config.countsAreEnabled) {
      let fileCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          tags: [],
          excludeTags: [],
          wildcardTags: [],
          constraints: []
        })

        fileCount = this.getCachedCount(hash)
      }

      if (!fileCount) {
        fileCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            files`
        ).pluck().get()

        this.addCachedCount(hash, fileCount)
      }

      data.fileCount = fileCount
    }

    return data
  },
  getByTags (page, tags, sort = 'id', direction = null, namespaces = []) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction, namespaces)

    if (!orderBy) {
      return this.getByTags(page, tags)
    }

    tags = [...new Set(tags)]

    let excludeTagConditions

    const excludeTags = this.extractExcludeTags(tags)

    tags = this.removeExcludeTags(tags)

    if (excludeTags.length) {
      if (!tags.length) {
        return this.getByExcludeTags(
          page, excludeTags, sort, direction, namespaces
        )
      }

      excludeTagConditions = this.generateExcludeTagConditions(excludeTags)
    }

    let wildcardTagConditions

    const wildcardTags = this.extractWildcardTags(tags)

    tags = this.removeWildcardTags(tags)

    if (wildcardTags.length) {
      if (!tags.length) {
        return this.getByWildcardTags(
          page, wildcardTags, excludeTags, sort, direction, namespaces
        )
      }

      wildcardTagConditions = this.generateWildcardTagConditions(
        wildcardTags, excludeTagConditions
      )
    }

    const params = [
      tags,
      tags.length,
      ...(excludeTags.length ? excludeTagConditions.params : []),
      ...(wildcardTags.length ? wildcardTagConditions.params : [])
    ]

    data.files = db.content.prepare(
      `SELECT
        files.id,
        files.hash,
        files.mime,
        files.size,
        files.width,
        files.height,
        files.tag_count AS tagCount
      FROM
        files
      WHERE
        files.tags_id IN (
          SELECT file_tags_id FROM mappings WHERE tag_id IN (
            SELECT id FROM tags
            WHERE name IN (${',?'.repeat(tags.length).replace(',', '')})
          )
          GROUP BY file_tags_id
          HAVING COUNT(*) = ?
          ${excludeTagConditions ? excludeTagConditions.clauses.join(' ') : ''}
        )
        ${wildcardTagConditions ? wildcardTagConditions.clauses.join(' ') : ''}
      ORDER BY
        ${orderBy}
      LIMIT
        ${config.filesPerPage}
      OFFSET
        ${(page - 1) * config.filesPerPage}`
    ).all(...params).map(file => this.prepareFile(file))

    if (config.countsAreEnabled) {
      let fileCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          tags: tags.sort(),
          excludeTags: excludeTagConditions
            ? excludeTagConditions.params.sort()
            : [],
          wildcardTags: wildcardTagConditions
            ? wildcardTagConditions.params.sort()
            : [],
          constraints: []
        })

        fileCount = this.getCachedCount(hash)
      }

      if (!fileCount) {
        fileCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            files
          WHERE
            files.tags_id IN (
              SELECT file_tags_id FROM mappings WHERE tag_id IN (
                SELECT id FROM tags
                WHERE name IN (${',?'.repeat(tags.length).replace(',', '')})
              )
              GROUP BY file_tags_id
              HAVING COUNT(*) = ?
              ${excludeTagConditions ? excludeTagConditions.clauses.join(' ') : ''}
            )
          ${wildcardTagConditions ? wildcardTagConditions.clauses.join(' ') : ''}`
        ).pluck().get(...params)

        this.addCachedCount(hash, fileCount)
      }

      data.fileCount = fileCount
    }

    return data
  },
  getByExcludeTags (
    page,
    excludeTags,
    sort = 'id',
    direction = null,
    namespaces = []
  ) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction, namespaces)

    if (!orderBy) {
      return this.getByExcludeTags(page, excludeTags)
    }

    const excludeTagConditions = this.generateExcludeTagConditions(
      excludeTags, false
    )

    data.files = db.content.prepare(
      `SELECT
        files.id,
        files.hash,
        files.mime,
        files.size,
        files.width,
        files.height,
        files.tag_count AS tagCount
      FROM
        files
      WHERE
        tags_id NOT IN (
          ${excludeTagConditions.clauses.join(' ')}
        )
      OR
        tags_id IS NULL
      ORDER BY
        ${orderBy}
      LIMIT
        ${config.filesPerPage}
      OFFSET
        ${(page - 1) * config.filesPerPage}`
    ).all(...excludeTagConditions.params).map(file => this.prepareFile(file))

    if (config.countsAreEnabled) {
      let fileCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          tags: [],
          wildcardTags: [],
          excludeTags: excludeTagConditions.params.sort(),
          constraints: []
        })

        fileCount = this.getCachedCount(hash)
      }

      if (!fileCount) {
        fileCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            files
          WHERE
            tags_id NOT IN (
              ${excludeTagConditions.clauses.join(' ')}
            )
          OR
            tags_id IS NULL`
        ).pluck().get(...excludeTagConditions.params)

        this.addCachedCount(hash, fileCount)
      }

      data.fileCount = fileCount
    }

    return data
  },
  getByWildcardTags (
    page,
    wildcardTags,
    excludeTags,
    sort = 'id',
    direction = null,
    namespaces = []
  ) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction, namespaces)

    if (!orderBy) {
      return this.getByWildcardTags(page, wildcardTags, excludeTags)
    }

    let excludeTagConditions

    if (excludeTags.length) {
      excludeTagConditions = this.generateExcludeTagConditions(excludeTags)
    }

    const wildcardTagConditions = this.generateWildcardTagConditions(
      wildcardTags, excludeTagConditions
    )

    wildcardTagConditions.clauses[0] = wildcardTagConditions.clauses[0].replace(
      'AND', 'WHERE'
    )

    data.files = db.content.prepare(
      `SELECT
        files.id,
        files.hash,
        files.mime,
        files.size,
        files.width,
        files.height,
        files.tag_count AS tagCount
      FROM
        files
      ${wildcardTagConditions.clauses.join(' ')}
      ORDER BY
        ${orderBy}
      LIMIT
        ${config.filesPerPage}
      OFFSET
        ${(page - 1) * config.filesPerPage}`
    ).all(...wildcardTagConditions.params).map(file => this.prepareFile(file))

    if (config.countsAreEnabled) {
      let fileCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          tags: [],
          wildcardTags: wildcardTagConditions.params.sort(),
          excludeTags: excludeTagConditions
            ? excludeTagConditions.params.sort()
            : [],
          constraints: []
        })

        fileCount = this.getCachedCount(hash)
      }

      if (!fileCount) {
        fileCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            files
          ${wildcardTagConditions.clauses.join(' ')}`
        ).pluck().get(...wildcardTagConditions.params)

        this.addCachedCount(hash, fileCount)
      }

      data.fileCount = fileCount
    }

    return data
  },
  getByConstraints (
    page,
    constraints,
    sort = 'id',
    direction = null,
    namespaces = []
  ) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction, namespaces)

    if (!orderBy) {
      return this.getByConstraints(page, constraints)
    }

    const constraintConditions = this.generateConstraintConditions(constraints)

    constraintConditions.clauses[0] = constraintConditions.clauses[0].replace(
      'AND', 'WHERE'
    )

    data.files = db.content.prepare(
      `SELECT
        id,
        hash,
        mime,
        size,
        width,
        height,
        tag_count AS tagCount
      FROM
        files
      ${constraintConditions.clauses.join(' ')}
      ORDER BY
        ${orderBy}
      LIMIT
        ${config.filesPerPage}
      OFFSET
        ${(page - 1) * config.filesPerPage}`
    ).all(...constraintConditions.params).map(file => this.prepareFile(file))

    if (config.countsAreEnabled) {
      let fileCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          tags: [],
          excludeTags: [],
          wildcardTags: [],
          constraints: constraints.sort()
        })

        fileCount = this.getCachedCount(hash)
      }

      if (!fileCount) {
        fileCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            files
          ${constraintConditions.clauses.join(' ')}`
        ).pluck().get(...constraintConditions.params)

        this.addCachedCount(hash, fileCount)
      }

      data.fileCount = fileCount
    }

    return data
  },
  getByTagsAndConstraints (
    page,
    tags,
    constraints,
    sort = 'id',
    direction = null,
    namespaces = []
  ) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction, namespaces)

    if (!orderBy) {
      return this.getByTagsAndConstraints(page, tags, constraints)
    }

    tags = [...new Set(tags)]

    let excludeTagConditions

    const excludeTags = this.extractExcludeTags(tags)

    tags = this.removeExcludeTags(tags)

    if (excludeTags.length) {
      if (!tags.length) {
        return this.getByExcludeTagsAndConstraints(
          page, excludeTags, constraints, sort, direction, namespaces
        )
      }

      excludeTagConditions = this.generateExcludeTagConditions(excludeTags)
    }

    let wildcardTagConditions

    const wildcardTags = this.extractWildcardTags(tags)

    tags = this.removeWildcardTags(tags)

    if (wildcardTags.length) {
      if (!tags.length) {
        return this.getByWildcardTagsAndConstraints(
          page,
          wildcardTags,
          excludeTags,
          constraints,
          sort,
          direction,
          namespaces
        )
      }

      wildcardTagConditions = this.generateWildcardTagConditions(
        wildcardTags, excludeTagConditions
      )
    }

    const constraintConditions = this.generateConstraintConditions(constraints)

    const params = [
      tags,
      tags.length,
      ...(excludeTags.length ? excludeTagConditions.params : []),
      ...(wildcardTags.length ? wildcardTagConditions.params : []),
      ...constraintConditions.params
    ]

    data.files = db.content.prepare(
      `SELECT
        files.id,
        files.hash,
        files.mime,
        files.size,
        files.width,
        files.height,
        files.tag_count AS tagCount
      FROM
        files
      WHERE
        files.tags_id IN (
          SELECT file_tags_id FROM mappings WHERE tag_id IN (
            SELECT id FROM tags
            WHERE name IN (${',?'.repeat(tags.length).replace(',', '')})
          )
          GROUP BY file_tags_id
          HAVING COUNT(*) = ?
          ${excludeTagConditions ? excludeTagConditions.clauses.join(' ') : ''}
        )
      ${wildcardTagConditions ? wildcardTagConditions.clauses.join(' ') : ''}
      ${constraintConditions.clauses.join(' ')}
      ORDER BY
        ${orderBy}
      LIMIT
        ${config.filesPerPage}
      OFFSET
        ${(page - 1) * config.filesPerPage}`
    ).all(...params).map(
      file => this.prepareFile(file)
    )

    if (config.countsAreEnabled) {
      let fileCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          tags: tags.sort(),
          excludeTags: excludeTagConditions
            ? excludeTagConditions.params.sort()
            : [],
          wildcardTags: wildcardTagConditions
            ? wildcardTagConditions.params.sort()
            : [],
          constraints: constraints.sort()
        })

        fileCount = this.getCachedCount(hash)
      }

      if (!fileCount) {
        fileCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            files
          WHERE
            files.tags_id IN (
              SELECT file_tags_id FROM mappings WHERE tag_id IN (
                SELECT id FROM tags
                WHERE name IN (${',?'.repeat(tags.length).replace(',', '')})
              )
              GROUP BY file_tags_id
              HAVING COUNT(*) = ?
              ${excludeTagConditions ? excludeTagConditions.clauses.join(' ') : ''}
            )
          ${wildcardTagConditions ? wildcardTagConditions.clauses.join(' ') : ''}
          ${constraintConditions.clauses.join(' ')}`
        ).pluck().get(...params)

        this.addCachedCount(hash, fileCount)
      }

      data.fileCount = fileCount
    }

    return data
  },
  getByExcludeTagsAndConstraints (
    page,
    excludeTags,
    constraints,
    sort = 'id',
    direction = null,
    namespaces = []
  ) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction, namespaces)

    if (!orderBy) {
      return this.getByExcludeTagsAndConstraints(
        page, excludeTags, constraints
      )
    }

    const excludeTagConditions = this.generateExcludeTagConditions(
      excludeTags, false
    )

    const constraintConditions = this.generateConstraintConditions(constraints)

    const params = [
      ...excludeTagConditions.params,
      ...constraintConditions.params
    ]

    data.files = db.content.prepare(
      `SELECT
        files.id,
        files.hash,
        files.mime,
        files.size,
        files.width,
        files.height,
        files.tag_count AS tagCount
      FROM
        files
      WHERE (
        tags_id NOT IN (
          ${excludeTagConditions.clauses.join(' ')}
        )
        OR
          tags_id IS NULL
      )
      ${constraintConditions.clauses.join(' ')}
      ORDER BY
        ${orderBy}
      LIMIT
        ${config.filesPerPage}
      OFFSET
        ${(page - 1) * config.filesPerPage}`
    ).all(...params).map(
      file => this.prepareFile(file)
    )

    if (config.countsAreEnabled) {
      let fileCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          tags: [],
          excludeTags: excludeTagConditions.params.sort(),
          wildcardTags: [],
          constraints: constraints.sort()
        })

        fileCount = this.getCachedCount(hash)
      }

      if (!fileCount) {
        fileCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            files
          WHERE (
            tags_id NOT IN (
              ${excludeTagConditions.clauses.join(' ')}
            )
            OR
              tags_id IS NULL
          )
          ${constraintConditions.clauses.join(' ')}`
        ).pluck().get(...params)

        this.addCachedCount(hash, fileCount)
      }

      data.fileCount = fileCount
    }

    return data
  },
  getByWildcardTagsAndConstraints (
    page,
    wildcardTags,
    excludeTags,
    constraints,
    sort = 'id',
    direction = null,
    namespaces = []
  ) {
    const data = {}

    const orderBy = this.generateOrderBy(sort, direction, namespaces)

    if (!orderBy) {
      return this.getByWildcardTagsAndConstraints(
        page, wildcardTags, excludeTags, constraints
      )
    }

    let excludeTagConditions

    if (excludeTags.length) {
      excludeTagConditions = this.generateExcludeTagConditions(excludeTags)
    }

    const wildcardTagConditions = this.generateWildcardTagConditions(
      wildcardTags, excludeTagConditions
    )

    wildcardTagConditions.clauses[0] = wildcardTagConditions.clauses[0].replace(
      'AND', 'WHERE'
    )

    const constraintConditions = this.generateConstraintConditions(constraints)

    const params = [
      ...wildcardTagConditions.params,
      ...constraintConditions.params
    ]

    data.files = db.content.prepare(
      `SELECT
        files.id,
        files.hash,
        files.mime,
        files.size,
        files.width,
        files.height,
        files.tag_count AS tagCount
      FROM
        files
      ${wildcardTagConditions.clauses.join(' ')}
      ${constraintConditions.clauses.join(' ')}
      ORDER BY
        ${orderBy}
      LIMIT
        ${config.filesPerPage}
      OFFSET
        ${(page - 1) * config.filesPerPage}`
    ).all(...params).map(file => this.prepareFile(file))

    if (config.countsAreEnabled) {
      let fileCount, hash

      if (config.countsCachingIsEnabled) {
        hash = objectHash({
          tags: [],
          wildcardTags: wildcardTagConditions.params.sort(),
          excludeTags: excludeTagConditions
            ? excludeTagConditions.params.sort()
            : [],
          constraints: constraints.sort()
        })

        fileCount = this.getCachedCount(hash)
      }

      if (!fileCount) {
        fileCount = db.content.prepare(
          `SELECT
            COUNT(*)
          FROM
            files
          ${wildcardTagConditions.clauses.join(' ')}
          ${constraintConditions.clauses.join(' ')}`
        ).pluck().get(...params)

        this.addCachedCount(hash, fileCount)
      }

      data.fileCount = fileCount
    }

    return data
  },
  getMimeTypes () {
    return db.content.prepare(
      'SELECT id AS name FROM mime_types'
    ).all().map(row => ({ name: config.availableMimeTypes[row.name] }))
  },
  getTotalCount () {
    return db.content.prepare(
      'SELECT COUNT(*) FROM files'
    ).pluck().get()
  },
  generateOrderBy (sort, direction, namespaces) {
    direction = ['asc', 'desc'].includes(direction) ? direction : null

    if (sort === 'namespaces' && namespaces.length) {
      const namespacesOrderBy = this.generateNamespacesOrderBy(
        namespaces, direction
      )

      if (!namespacesOrderBy.length) {
        return null
      }

      return `${namespacesOrderBy.join(',')}, files.id DESC`
    }

    switch (sort) {
      case 'size':
        return `files.size ${direction || 'DESC'}`
      case 'width':
        return `files.width ${direction || 'DESC'}`
      case 'height':
        return `files.height ${direction || 'DESC'}`
      case 'mime':
        return `files.mime ${direction || 'ASC'}`
      case 'tags':
        return `files.tag_count ${direction || 'DESC'}`
      case 'random':
        return 'files.random ASC'
      default:
        return `files.id ${direction || 'DESC'}`
    }
  },
  generateNamespacesOrderBy (namespaces, direction) {
    namespaces = [...new Set(namespaces)]

    const validNamespaces = tagsRepository.getNamespaces().map(
      namespace => namespace.name
    )

    namespaces = namespaces.filter(
      namespace => validNamespaces.includes(namespace)
    )

    if (!namespaces.length) {
      return []
    }

    const namespacesOrderBy = []

    for (let namespace of namespaces) {
      namespace = namespace.split(' ').join('_')

      namespacesOrderBy.push(
        `CASE
          WHEN namespace_${namespace} IS NULL THEN 1
          ELSE 0
        END,
        CASE
          WHEN namespace_${namespace} GLOB '*[^0-9]*'
            THEN namespace_${namespace}
          ELSE CAST(namespace_${namespace} AS DECIMAL)
        END ${direction || 'ASC'}`
      )
    }

    return namespacesOrderBy
  },
  generateExcludeTagConditions (excludeTags, isException = true) {
    let clauses = []
    let params = []

    clauses.push(
      isException
        ? 'EXCEPT SELECT file_tags_id from mappings'
        : 'SELECT file_tags_id FROM mappings'
    )

    const wildcardExcludeTags = this.extractWildcardTags(excludeTags)

    for (const tag of wildcardExcludeTags) {
      clauses.push(
        `OR tag_id IN (
          SELECT id FROM tags
          WHERE name LIKE ? ESCAPE '^'
        )`
      )

      params.push(this.finalizeWildcardTag(tag))
    }

    excludeTags = this.removeWildcardTags(excludeTags)

    if (excludeTags.length) {
      clauses = clauses.concat(
        `OR tag_id IN (
          SELECT id FROM tags
          WHERE name IN (${',?'.repeat(excludeTags.length).replace(',', '')})
        )`
      )

      params = params.concat(excludeTags)
    }

    clauses[1] = clauses[1].replace('OR', 'WHERE')

    return {
      clauses: clauses,
      params: params
    }
  },
  generateWildcardTagConditions (wildcardTags, excludeTagConditions = null) {
    const clauses = []
    const params = []

    for (const tag of wildcardTags) {
      clauses.push(
        `AND
          files.tags_id IN (
            SELECT file_tags_id FROM mappings WHERE tag_id IN (
              SELECT id FROM tags
              WHERE name LIKE ? ESCAPE '^'
            )
            ${excludeTagConditions ? excludeTagConditions.clauses.join(' ') : ''}
          )
        `
      )

      params.push(this.finalizeWildcardTag(tag))

      if (excludeTagConditions) {
        for (const param of excludeTagConditions.params) {
          params.push(param)
        }
      }
    }

    return {
      clauses: clauses,
      params: params
    }
  },
  generateConstraintConditions (constraints) {
    const orConditions = {
      id: { clauses: [], params: [] },
      hash: { clauses: [], params: [] },
      size: { clauses: [], params: [] },
      width: { clauses: [], params: [] },
      height: { clauses: [], params: [] },
      mime: { clauses: [], params: [] },
      tags: { clauses: [], params: [] }
    }
    const andConditions = {
      id: { clauses: [], params: [] },
      hash: { clauses: [], params: [] },
      size: { clauses: [], params: [] },
      width: { clauses: [], params: [] },
      height: { clauses: [], params: [] },
      mime: { clauses: [], params: [] },
      tags: { clauses: [], params: [] }
    }

    for (let constraint of constraints) {
      constraint = constraintsHelper.getConstraintParts(constraint)

      const field = constraint.field === 'tags'
        ? 'tag_count'
        : constraint.field

      switch (constraint.field) {
        case 'id':
        case 'width':
        case 'height':
        case 'tags':
          switch (constraint.comparator) {
            case '=':
            case '>':
            case '<':
              constraint.value = parseInt(constraint.value)

              orConditions[constraint.field].clauses.push(
                `files.${field} ${constraint.comparator} ?`
              )
              orConditions[constraint.field].params.push(constraint.value)

              break
            case '!=':
              constraint.value = parseInt(constraint.value)

              andConditions[constraint.field].clauses.push(
                `files.${field} ${constraint.comparator} ?`
              )
              andConditions[constraint.field].params.push(constraint.value)

              break
            case '~=':
              constraint.value = parseInt(constraint.value)

              const deviance = constraintsHelper.getDeviance(constraint.value)

              orConditions[constraint.field].clauses.push(
                `(files.${field} >= ? AND files.${field} <= ?)`
              )
              orConditions[constraint.field].params.push(
                Math.round(constraint.value - deviance)
              )
              orConditions[constraint.field].params.push(
                Math.round(constraint.value + deviance)
              )

              break
            case '><':
              const rangeValues = constraint.value.split(',').map(
                value => parseInt(value)
              )

              rangeValues.sort((a, b) => a - b)

              orConditions[constraint.field].clauses.push(
                `files.${field} > ? AND files.${field} < ?`
              )
              orConditions[constraint.field].params.push(rangeValues[0])
              orConditions[constraint.field].params.push(rangeValues[1])
          }

          break
        case 'size':
          switch (constraint.comparator) {
            case '=':
            case '>':
            case '<':
              constraint.value = constraintsHelper.getSizeInBytes(
                constraint.value
              )

              orConditions[constraint.field].clauses.push(
                `files.${field} ${constraint.comparator} ?`
              )
              orConditions[constraint.field].params.push(constraint.value)

              break
            case '!=':
              constraint.value = constraintsHelper.getSizeInBytes(
                constraint.value
              )

              andConditions[constraint.field].clauses.push(
                `files.${field} ${constraint.comparator} ?`
              )
              andConditions[constraint.field].params.push(constraint.value)

              break
            case '~=':
              constraint.value = constraintsHelper.getSizeInBytes(
                constraint.value
              )

              const deviance = constraintsHelper.getDeviance(constraint.value)

              orConditions[constraint.field].clauses.push(
                `(files.${field} >= ? AND files.${field} <= ?)`
              )
              orConditions[constraint.field].params.push(
                Math.round(constraint.value - deviance)
              )
              orConditions[constraint.field].params.push(
                Math.round(constraint.value + deviance)
              )

              break
            case '><':
              const rangeValues = constraint.value.split(',').map(
                value => constraintsHelper.getSizeInBytes(value)
              )

              rangeValues.sort((a, b) => a - b)

              orConditions[constraint.field].clauses.push(
                `files.${field} > ? AND files.${field} < ?`
              )
              orConditions[constraint.field].params.push(rangeValues[0])
              orConditions[constraint.field].params.push(rangeValues[1])
          }

          break
        case 'hash':
          switch (constraint.comparator) {
            case '=':
              orConditions[constraint.field].clauses.push(
                `files.${field} ${constraint.comparator} ?`
              )
              orConditions[constraint.field].params.push(constraint.value)

              break
            case '!=':
              andConditions[constraint.field].clauses.push(
                `files.${field} ${constraint.comparator} ?`
              )
              andConditions[constraint.field].params.push(constraint.value)
          }

          break
        case 'mime':
          switch (constraint.comparator) {
            case '=':
              orConditions[constraint.field].clauses.push(
                `files.${field} ${constraint.comparator} ?`
              )
              orConditions[constraint.field].params.push(
                constraintsHelper.getMimeId(constraint.value)
              )

              break
            case '!=':
              andConditions[constraint.field].clauses.push(
                `files.${field} ${constraint.comparator} ?`
              )
              andConditions[constraint.field].params.push(
                constraintsHelper.getMimeId(constraint.value)
              )
          }
      }
    }

    const keys = ['id', 'hash', 'size', 'width', 'height', 'mime', 'tags']

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(orConditions, key)) {
        if (!orConditions[key].clauses.length) {
          delete orConditions[key]
        }
      }

      if (Object.prototype.hasOwnProperty.call(andConditions, key)) {
        if (!andConditions[key].clauses.length) {
          delete andConditions[key]
        }
      }
    }

    const clauses = []
    const params = []

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(orConditions, key)) {
        clauses.push('AND (')

        if (Object.prototype.hasOwnProperty.call(andConditions, key)) {
          clauses.push('(')
          clauses.push(andConditions[key].clauses.join(' AND '))
          clauses.push(')')
          clauses.push(' AND (')

          params.push(...andConditions[key].params)
        }

        clauses.push(orConditions[key].clauses.join(' OR '))
        clauses.push(')')

        if (Object.prototype.hasOwnProperty.call(andConditions, key)) {
          clauses.push(')')
        }

        params.push(...orConditions[key].params)
      } else if (Object.prototype.hasOwnProperty.call(andConditions, key)) {
        clauses.push('AND (')
        clauses.push(andConditions[key].clauses.join(' AND '))
        clauses.push(')')

        params.push(...andConditions[key].params)
      }
    }

    return {
      clauses: clauses,
      params: params
    }
  },
  extractExcludeTags (tags) {
    return tags.filter(
      tag => tag.startsWith('-')
    ).map(
      tag => tag.replace('-', '')
    )
  },
  removeExcludeTags (tags) {
    return tags.filter(
      tag => !tag.startsWith('-')
    ).map(
      tag => tag.replace('\\-', '-')
    )
  },
  extractWildcardTags (tags) {
    return [...new Set(
      tags.filter(
        tag => tag.startsWith('*') ||
          (tag.endsWith('*') && !tag.endsWith('\\*'))
      ).map(
        tag => tag.replace(
          /^\\\*/, '###ASTERISK###'
        ).replace(
          /\\\*$/, '###ASTERISK###'
        )
      ).map(
        tag => tag.replace(/^\*{2,}/, '*').replace(/\*{2,}$/, '*')
      )
    )]
  },
  removeWildcardTags (tags) {
    return tags.filter(
      tag => !(tag.startsWith('*') ||
        (tag.endsWith('*') && !tag.endsWith('\\*')))
    ).map(
      tag => tag.replace(/^\\\*/, '*').replace(/\\\*$/, '*')
    )
  },
  finalizeWildcardTag (tag) {
    return queryHelper.escapeSpecialCharacters(tag)
      .replace(/^\*/, '%')
      .replace(/\*$/, '%')
      .split('###ASTERISK###')
      .join('*')
  },
  generateFilePath (type, hash) {
    if (type === 'thumbnail') {
      return `${config.url}${config.mediaBase}/thumbnails/${hash}`
    }

    return `${config.url}${config.mediaBase}/original/${hash}`
  },
  prepareFile (file) {
    if (!file) {
      return file
    }

    file.mime = config.availableMimeTypes[file.mime]
    file.mediaUrl = this.generateFilePath('original', file.hash)
    file.thumbnailUrl = this.generateFilePath('thumbnail', file.hash)

    return file
  },
  getCachedCount (hash) {
    return db.content.prepare(
      `SELECT
        count
      FROM
        file_counts
      WHERE
        hash = ?`
    ).pluck().get(hash)
  },
  addCachedCount (hash, fileCount) {
    if (!config.countsCachingIsEnabled) {
      return
    }

    db.content.prepare(
      'INSERT OR IGNORE INTO file_counts (hash, count) VALUES (?, ?)'
    ).run(hash, fileCount)
  }
}

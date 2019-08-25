const files = require('../repositories/files')

module.exports = {
  getFileById (id) {
    return files.getById(id)
  },
  getFiles (query) {
    if (query.tags) {
      return query.constraints
        ? files.getByTagsAndConstraints(
          query.page,
          query.tags,
          query.constraints,
          query.sort || 'id',
          query.direction || null,
          query.namespaces || []
        )
        : files.getByTags(
          query.page,
          query.tags,
          query.sort || 'id',
          query.direction || null,
          query.namespaces || []
        )
    }

    return query.constraints
      ? files.getByConstraints(
        query.page,
        query.constraints,
        query.sort || 'id',
        query.direction || null,
        query.namespaces || []
      )
      : files.get(
        query.page,
        query.sort || 'id',
        query.direction || null,
        query.namespaces || []
      )
  },
  getMimeTypes () {
    return files.getMimeTypes()
  },
  getTotalFileCount () {
    return files.getTotalCount()
  }
}

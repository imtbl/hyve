const tags = require('../repositories/tags')

module.exports = {
  getTags (query) {
    return query.contains
      ? tags.getContaining(
        query.page,
        query.contains,
        query.sort || 'id',
        query.direction || null
      )
      : tags.get(
        query.page,
        query.sort || 'id',
        query.direction || null
      )
  },
  getTagsOfFile (fileId) {
    return tags.getOfFile(fileId)
  },
  completeTag (partialTag) {
    return tags.complete(partialTag)
  },
  getNamespaces () {
    return tags.getNamespaces()
  },
  getTotalTagCount () {
    return tags.getTotalCount()
  }
}

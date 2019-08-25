const fs = require('fs')
const path = require('path')

const config = require('../config')

const lockFilePath = path.resolve(
  path.dirname(config.contentDbPath), '.sync-lock'
)

function exists () {
  return fs.existsSync(lockFilePath)
}

function create () {
  fs.closeSync(fs.openSync(lockFilePath, 'w'))
}

function remove () {
  if (exists()) {
    fs.unlinkSync(lockFilePath)
  }
}

module.exports = {
  path: lockFilePath,
  exists,
  create,
  remove
}

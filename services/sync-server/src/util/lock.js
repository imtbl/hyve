const fs = require('fs')
const path = require('path')

const config = require('../config')

const lockFilePath = path.resolve(
  path.dirname(config.contentDbPath), '.sync-lock'
)

module.exports = {
  exists () {
    return fs.existsSync(lockFilePath)
  },
  create () {
    fs.closeSync(fs.openSync(lockFilePath, 'w'))
  },
  remove () {
    if (this.exists()) {
      fs.unlinkSync(lockFilePath)
    }
  }
}

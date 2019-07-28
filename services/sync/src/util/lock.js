const fs = require('fs')
const path = require('path')

const lockFilePath = path.resolve(__dirname, '../..', '.sync-lock')

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

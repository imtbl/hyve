const fs = require('fs')
const path = require('path')
const fileType = require('file-type')
const readChunk = require('read-chunk')

const config = require('../config')

module.exports = {
  getFilePathWithExtension (directory, hash) {
    return new Promise((resolve, reject) => {
      fs.readdir(directory, (err, filePaths) => {
        if (err) {
          reject(err)
        }

        for (const filePath of filePaths) {
          if (filePath.startsWith(hash)) {
            resolve(path.join(directory, filePath))
          }
        }

        reject(new Error('No matching file found.'))
      })
    })
  },
  async fileExists (type, hash) {
    const directory = config.hydrusFilesMode === 'client'
      ? type === 'thumbnail'
        ? `t${hash.substring(0, 2)}`
        : `f${hash.substring(0, 2)}`
      : hash.substring(0, 2)
    const extension = type === 'thumbnail' ? '.thumbnail' : ''

    let filePath = path.join(
      config.hydrusFilesPath, directory, `${hash}${extension}`
    )

    if (type !== 'thumbnail' && config.hydrusFilesMode === 'client') {
      filePath = await this.getFilePathWithExtension(
        path.join(config.hydrusFilesPath, directory),
        hash
      )
    }

    return new Promise((resolve, reject) => {
      fs.access(filePath, err => {
        if (err) {
          reject(err)
        }

        resolve(true)
      })
    })
  },
  async getFileData (type, hash) {
    const directory = config.hydrusFilesMode === 'client'
      ? type === 'thumbnail'
        ? `t${hash.substring(0, 2)}`
        : `f${hash.substring(0, 2)}`
      : hash.substring(0, 2)
    const extension = type === 'thumbnail' ? '.thumbnail' : ''

    let filePath = path.join(
      config.hydrusFilesPath, directory, `${hash}${extension}`
    )

    if (type !== 'thumbnail' && config.hydrusFilesMode === 'client') {
      filePath = await this.getFilePathWithExtension(
        path.join(config.hydrusFilesPath, directory),
        hash
      )
    }

    return {
      path: filePath,
      mimeType: fileType(await readChunk(filePath, 0, 4100)).mime
    }
  }
}

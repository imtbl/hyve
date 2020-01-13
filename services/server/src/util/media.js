const fs = require('fs')
const path = require('path')
const FileType = require('file-type')

const config = require('../config')

function getFilePathWithExtension (directory, hash) {
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
}

async function fileExists (type, hash) {
  const basePath = type === 'thumbnail' && config.hydrusFilesMode === 'client'
    ? config.hydrusThumbnailsPath
    : config.hydrusFilesPath
  const directory = config.hydrusFilesMode === 'client'
    ? type === 'thumbnail'
      ? `t${hash.substring(0, 2)}`
      : `f${hash.substring(0, 2)}`
    : hash.substring(0, 2)
  const extension = type === 'thumbnail' ? '.thumbnail' : ''

  const filePath = type !== 'thumbnail' && config.hydrusFilesMode === 'client'
    ? await getFilePathWithExtension(
      path.join(config.hydrusFilesPath, directory),
      hash
    )
    : path.join(basePath, directory, `${hash}${extension}`)

  return new Promise((resolve, reject) => {
    fs.access(filePath, err => {
      if (err) {
        reject(err)
      }

      resolve(true)
    })
  })
}

async function getFileData (type, hash) {
  const basePath = type === 'thumbnail' && config.hydrusFilesMode === 'client'
    ? config.hydrusThumbnailsPath
    : config.hydrusFilesPath
  const directory = config.hydrusFilesMode === 'client'
    ? type === 'thumbnail'
      ? `t${hash.substring(0, 2)}`
      : `f${hash.substring(0, 2)}`
    : hash.substring(0, 2)
  const extension = type === 'thumbnail' ? '.thumbnail' : ''

  const filePath = type !== 'thumbnail' && config.hydrusFilesMode === 'client'
    ? await getFilePathWithExtension(
      path.join(config.hydrusFilesPath, directory),
      hash
    )
    : path.join(basePath, directory, `${hash}${extension}`)

  const fileInfo = await FileType.fromFile(filePath)

  return {
    path: filePath,
    mimeType: fileInfo && fileInfo.mime
      ? fileInfo.mime
      : 'application/octet-stream'
  }
}

module.exports = {
  fileExists,
  getFileData
}

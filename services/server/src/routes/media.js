const router = require('express').Router()

const config = require('../config')
const middleware = require('../middleware')
const controllers = require('../controllers')
const mediaHelper = require('../util/media')

router.get('/original/:mediaHash',
  middleware.media.get.inputValidationConfig,
  middleware.media.get.validateInput,
  async (req, res, next) => {
    if (config.authenticationIsRequired) {
      try {
        if (!controllers.authentication.isValidMediaToken(req.query.token)) {
          return next({
            customStatus: 404,
            customName: 'NotFoundError'
          })
        }
      } catch (err) {
        return next(err)
      }
    }

    try {
      await mediaHelper.fileExists('original', req.params.mediaHash)
    } catch (err) {
      return next({
        customStatus: 404,
        customName: 'NotFoundError'
      })
    }

    let fileData

    try {
      fileData = await mediaHelper.getFileData(
        'original', req.params.mediaHash
      )
    } catch (err) {
      return next({
        customStatus: 404,
        customName: 'NotFoundError'
      })
    }

    res.sendFile(fileData.path, {
      headers: {
        'Content-Type': fileData.mimeType
      }
    })
  }
)

router.get('/thumbnails/:mediaHash',
  middleware.media.get.inputValidationConfig,
  middleware.media.get.validateInput,
  async (req, res, next) => {
    if (config.authenticationIsRequired) {
      try {
        if (!controllers.authentication.isValidMediaToken(req.query.token)) {
          return next({
            customStatus: 404,
            customName: 'NotFoundError'
          })
        }
      } catch (err) {
        return next(err)
      }
    }

    try {
      await mediaHelper.fileExists('thumbnail', req.params.mediaHash)
    } catch (err) {
      return next({
        customStatus: 404,
        customName: 'NotFoundError'
      })
    }

    let fileData

    try {
      fileData = await mediaHelper.getFileData(
        'thumbnail', req.params.mediaHash
      )
    } catch (err) {
      return next({
        customStatus: 404,
        customName: 'NotFoundError'
      })
    }

    res.sendFile(fileData.path, {
      headers: {
        'Content-Type': fileData.mimeType
      }
    })
  }
)

module.exports = router

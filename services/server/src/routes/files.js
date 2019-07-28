const router = require('express').Router()

const config = require('../config')
const middleware = require('../middleware')
const controllers = require('../controllers')

router.get('/',
  ...(config.authenticationIsRequired
    ? [middleware.authentication.validateToken]
    : []
  ),
  middleware.files.get.inputValidationConfig,
  middleware.files.get.validateInput,
  (req, res, next) => {
    let data

    try {
      data = controllers.files.getFiles(req.query)
    } catch (err) {
      return next(err)
    }

    res.send(data)
  }
)

router.get('/:id',
  ...(config.authenticationIsRequired
    ? [middleware.authentication.validateToken]
    : []
  ),
  middleware.files.getSingle.inputValidationConfig,
  middleware.files.getSingle.validateInput,
  (req, res, next) => {
    let data

    try {
      data = controllers.files.getFileById(req.params.id)
    } catch (err) {
      return next(err)
    }

    if (!data) {
      return next({
        customStatus: 404,
        customName: 'NotFoundError'
      })
    }

    try {
      data.tags = controllers.tags.getTagsOfFile(req.params.id)
    } catch (err) {
      return next(err)
    }

    res.send(data)
  }
)

module.exports = router

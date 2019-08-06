const router = require('express').Router()

const config = require('../config')
const middleware = require('../middleware')
const controllers = require('../controllers')

router.get('/',
  ...(config.authenticationIsRequired
    ? [middleware.authentication.validateToken]
    : []
  ),
  (req, res, next) => {
    const data = {}

    try {
      data.mimeTypes = controllers.files.getMimeTypes()
    } catch (err) {
      return next(err)
    }

    res.send(data)
  }
)

module.exports = router

const router = require('express').Router()

const config = require('../config')
const middleware = require('../middleware')
const controllers = require('../controllers')

router.get('/',
  ...(config.authenticationIsRequired
    ? [middleware.authentication.validateToken]
    : []
  ),
  middleware.tags.get.inputValidationConfig,
  middleware.tags.get.validateInput,
  (req, res, next) => {
    let data

    try {
      data = controllers.tags.getTags(req.query)
    } catch (err) {
      return next(err)
    }

    res.send(data)
  }
)

module.exports = router

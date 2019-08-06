const router = require('express').Router()

const middleware = require('../middleware')
const controllers = require('../controllers')

router.get('/',
  middleware.authentication.validateToken,
  (req, res, next) => {
    const data = {}

    try {
      data.tokens = controllers.authentication.getTokens(res.locals.userId)
    } catch (err) {
      return next(err)
    }

    res.send(data)
  }
)

router.post('/',
  middleware.authentication.createToken.inputValidationConfig,
  middleware.authentication.createToken.validateInput,
  async (req, res, next) => {
    let validUser

    try {
      validUser = await controllers.authentication.getValidUser(
        req.body.username, req.body.password, true
      )

      if (!validUser) {
        return next({
          customStatus: 400,
          customName: 'InvalidUserError'
        })
      }
    } catch (err) {
      return next(err)
    }

    let data

    try {
      data = await controllers.authentication.createToken(
        validUser.id, req.ip, req.headers['user-agent'], req.body.long
      )
    } catch (err) {
      return next(err)
    }

    res.send(data)
  }
)

router.delete('/',
  middleware.authentication.validateToken,
  middleware.authentication.deleteToken.inputValidationConfig,
  middleware.authentication.deleteToken.validateInput,
  (req, res, next) => {
    try {
      controllers.authentication.deleteTokens(
        res.locals.userId, res.locals.token, req.body.all
      )
    } catch (err) {
      return next(err)
    }

    res.send({
      success: true
    })
  }
)

module.exports = router

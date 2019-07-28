const router = require('express').Router()

const middleware = require('../middleware')
const controllers = require('../controllers')

router.get('/',
  middleware.authentication.validateToken,
  (req, res, next) => {
    let data

    try {
      data = controllers.authentication.getUserById(res.locals.userId)
    } catch (err) {
      return next(err)
    }

    res.send(data)
  }
)

router.post('/',
  middleware.authentication.createUser.inputValidationConfig,
  middleware.authentication.createUser.validateInput,
  async (req, res, next) => {
    try {
      if (controllers.authentication.getUserByName(req.body.username)) {
        return next({
          customStatus: 400,
          customName: 'UsernameExistsError'
        })
      }
    } catch (err) {
      return next(err)
    }

    let data

    try {
      data = await controllers.authentication.createUser(
        req.body.username, req.body.password
      )
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return next({
          customStatus: 400,
          customName: 'UsernameExistsError'
        })
      }

      return next(err)
    }

    res.send(data)
  }
)

router.put('/',
  middleware.authentication.validateToken,
  middleware.authentication.updateUser.inputValidationConfig,
  middleware.authentication.updateUser.validateInput,
  async (req, res, next) => {
    if (req.body.username) {
      try {
        if (controllers.authentication.getUserByName(req.body.username)) {
          return next({
            customStatus: 400,
            customName: 'UsernameExistsError'
          })
        }
      } catch (err) {
        return next(err)
      }
    }

    let validUser

    try {
      validUser = await controllers.authentication.getValidUser(
        res.locals.userId, req.body.currentPassword
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
      data = await controllers.authentication.updateUser(
        res.locals.userId, req.body
      )
    } catch (err) {
      return next(err)
    }

    res.send(data)
  }
)

router.delete('/',
  middleware.authentication.validateToken,
  middleware.authentication.deleteUser.inputValidationConfig,
  middleware.authentication.deleteUser.validateInput,
  async (req, res, next) => {
    let validUser

    try {
      validUser = await controllers.authentication.getValidUser(
        res.locals.userId, req.body.password
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

    try {
      controllers.authentication.deleteUser(
        res.locals.userId
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

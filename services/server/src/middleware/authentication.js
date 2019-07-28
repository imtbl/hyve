const { check, validationResult, sanitizeBody } = require('express-validator')
const config = require('../config')
const auth = require('../controllers/authentication')

module.exports = {
  validateToken: (req, res, next) => {
    if (!req.headers.authorization) {
      return next({
        customStatus: 403,
        customName: 'MissingTokenError'
      })
    }

    let userId
    const hash = req.headers.authorization.replace('Bearer ', '')

    try {
      userId = auth.validateTokenAndGetUserId(hash)
    } catch (err) {
      return next(err)
    }

    if (userId === false) {
      return next({
        customStatus: 403,
        customName: 'InvalidTokenError'
      })
    }

    res.locals.token = hash
    res.locals.userId = userId

    next()
  },
  createUser: {
    inputValidationConfig: [
      sanitizeBody('username').trim(),
      check('username')
        .exists().withMessage('MissingUsernameFieldError')
        .isString().withMessage('InvalidUsernameFieldError')
        .isLength({ min: 1, max: 1024 }).withMessage(
          'InvalidUsernameFieldError'
        ),
      sanitizeBody('password').trim(),
      check('password')
        .exists().withMessage('MissingPasswordFieldError')
        .isString().withMessage('InvalidPasswordFieldError')
        .isLength({
          min: config.minPasswordLength < 1024
            ? config.minPasswordLength
            : 1024,
          max: 1024
        }).withMessage('InvalidPasswordFieldError')
    ],
    validateInput: (req, res, next) => {
      if (!config.registrationIsEnabled) {
        return next({
          customStatus: 400,
          customName: 'RegistrationDisabledError'
        })
      }

      const err = validationResult(req)

      if (!err.isEmpty()) {
        return next({
          customStatus: 400,
          customName: err.array()[0].msg
        })
      }

      next()
    }
  },
  updateUser: {
    inputValidationConfig: [
      sanitizeBody('username').trim(),
      check('username')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidUsernameFieldError')
        .isLength({ min: 1, max: 1024 }).withMessage(
          'InvalidUsernameFieldError'
        ),
      sanitizeBody('password').trim(),
      check('password')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidPasswordFieldError')
        .isLength({
          min: config.minPasswordLength < 1024
            ? config.minPasswordLength
            : 1024,
          max: 1024
        }).withMessage('InvalidPasswordFieldError'),
      sanitizeBody('currentPassword').trim(),
      check('currentPassword')
        .exists().withMessage('MissingCurrentPasswordFieldError')
        .isString().withMessage('InvalidCurrentPasswordFieldError')
    ],
    validateInput: (req, res, next) => {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        return next({
          customStatus: 400,
          customName: err.array()[0].msg
        })
      }

      if (!(req.body.username || req.body.password)) {
        return next({
          customStatus: 400,
          customName: 'NoUpdateFieldsError'
        })
      }

      next()
    }
  },
  deleteUser: {
    inputValidationConfig: [
      sanitizeBody('password').trim(),
      check('password')
        .exists().withMessage('MissingPasswordFieldError')
        .isString().withMessage('InvalidPasswordFieldError')
    ],
    validateInput: (req, res, next) => {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        return next({
          customStatus: 400,
          customName: err.array()[0].msg
        })
      }

      next()
    }
  },
  createToken: {
    inputValidationConfig: [
      sanitizeBody('username').trim(),
      check('username')
        .exists().withMessage('MissingUsernameFieldError')
        .isString().withMessage('InvalidUsernameFieldError'),
      sanitizeBody('password').trim(),
      check('password')
        .exists().withMessage('MissingPasswordFieldError')
        .isString().withMessage('InvalidPasswordFieldError'),
      check('long')
        .optional()
        .isBoolean().withMessage('InvalidLongFieldError')
    ],
    validateInput: (req, res, next) => {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        return next({
          customStatus: 400,
          customName: err.array()[0].msg
        })
      }

      next()
    }
  },
  deleteToken: {
    inputValidationConfig: [
      check('all')
        .optional()
        .isBoolean().withMessage('InvalidAllFieldError')
    ],
    validateInput: (req, res, next) => {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        return next({
          customStatus: 400,
          customName: err.array()[0].msg
        })
      }

      next()
    }
  }
}

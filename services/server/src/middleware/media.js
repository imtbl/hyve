const {
  check,
  validationResult,
  sanitizeParam,
  sanitizeQuery
} = require('express-validator')

const config = require('../config')

module.exports = {
  get: {
    inputValidationConfig: [
      sanitizeParam('mediaHash').trim(),
      check('mediaHash')
        .exists().withMessage('MissingMediaHashParameterError')
        .isString().withMessage('InvalidMediaHashParameterError')
        .isLength({ min: 1 }).withMessage('InvalidMediaHashParameterError'),
      sanitizeQuery('token').trim(),
      check('token')
        .optional({ nullable: true, checkFalsy: true })
        .exists().withMessage('MissingMediaTokenError')
        .isString().withMessage('InvalidMediaTokenError')
        .isLength({ min: 128, max: 128 }).withMessage('InvalidMediaTokenError')
    ],
    validateInput: (req, res, next) => {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        return next({
          customStatus: 400,
          customName: err.array()[0].msg
        })
      }

      if (config.authenticationIsRequired && !req.query.token) {
        return next({
          customStatus: 400,
          customName: 'MissingMediaTokenError'
        })
      }

      next()
    }
  }
}

const {
  check,
  validationResult,
  sanitizeBody,
  sanitizeQuery
} = require('express-validator')

module.exports = {
  get: {
    inputValidationConfig: [
      sanitizeQuery('page').trim(),
      check('page')
        .exists().withMessage('MissingPageParameterError')
        .isInt({ min: 1 }).withMessage('InvalidPageParameterError'),
      sanitizeQuery('contains').trim(),
      check('contains')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidContainsParameterError')
        .isLength({ min: 1 }).withMessage('InvalidContainsParameterError'),
      sanitizeQuery('sort').trim(),
      check('sort')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidSortParameterError')
        .isIn(
          ['id', 'name', 'files', 'contains', 'random']
        ).withMessage('InvalidSortParameterError'),
      sanitizeQuery('direction').trim(),
      check('direction')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidDirectionParameterError')
        .isIn(['asc', 'desc']).withMessage('InvalidDirectionParameterError')
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
  autocomplete: {
    inputValidationConfig: [
      sanitizeBody('partialTag').trim(),
      check('partialTag')
        .exists().withMessage('MissingPartialTagFieldError')
        .isString().withMessage('InvalidPartialTagFieldError')
        .isLength({ min: 1 }).withMessage('InvalidPartialTagFieldError')
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

const { body, query, validationResult } = require('express-validator')

module.exports = {
  get: {
    inputValidationConfig: [
      query('page')
        .trim()
        .exists().withMessage('MissingPageParameterError')
        .isInt({ min: 1 }).withMessage('InvalidPageParameterError'),
      query('contains')
        .trim()
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidContainsParameterError')
        .isLength({ min: 1 }).withMessage('InvalidContainsParameterError'),
      query('sort')
        .trim()
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidSortParameterError')
        .isIn(
          ['id', 'name', 'files', 'contains', 'random']
        ).withMessage('InvalidSortParameterError'),
      query('direction')
        .trim()
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
      body('partialTag')
        .trim()
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

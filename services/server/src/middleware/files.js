const {
  check,
  validationResult,
  sanitizeParam,
  sanitizeQuery
} = require('express-validator')

const constraintsHelper = require('../util/constraints')

module.exports = {
  get: {
    inputValidationConfig: [
      sanitizeQuery('page').trim(),
      check('page')
        .exists().withMessage('MissingPageParameterError')
        .isInt({ min: 1 }).withMessage('InvalidPageParameterError'),
      sanitizeQuery('tags'),
      check('tags')
        .optional()
        .isArray().withMessage('InvalidTagsParameterError')
        .isLength({ min: 1 }).withMessage('InvalidTagsParameterError')
        .custom(tags => {
          for (const tag of tags) {
            if (['*', '**', '-', '-*', '-**'].includes(tag)) {
              return false
            }
          }

          return true
        }).withMessage('InvalidTagsParameterError'),
      sanitizeQuery('constraints'),
      check('constraints')
        .optional()
        .isArray().withMessage('InvalidConstraintsParameterError')
        .isLength({ min: 1 }).withMessage('InvalidConstraintsParameterError')
        .custom(constraints => {
          for (const constraint of constraints) {
            if (!constraintsHelper.isValidConstraint(constraint)) {
              return false
            }
          }

          return true
        }).withMessage('InvalidConstraintsParameterError'),
      sanitizeQuery('sort').trim(),
      check('sort')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidSortParameterError')
        .isIn(
          [
            'id',
            'size',
            'width',
            'height',
            'mime',
            'tags',
            'namespaces',
            'random'
          ]
        ).withMessage('InvalidSortParameterError'),
      sanitizeQuery('direction').trim(),
      check('direction')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidDirectionParameterError')
        .isIn(['asc', 'desc']).withMessage('InvalidDirectionParameterError'),
      sanitizeQuery('namespaces'),
      check('namespaces')
        .optional()
        .isArray().withMessage('InvalidNamespacesParameterError')
        .isLength({ min: 1 }).withMessage('InvalidNamespacesParameterError')
    ],
    validateInput: (req, res, next) => {
      const err = validationResult(req)

      if (!err.isEmpty()) {
        return next({
          customStatus: 400,
          customName: err.array()[0].msg
        })
      }

      if (req.query.sort === 'namespaces' && !req.query.namespaces) {
        return next({
          customStatus: 400,
          customName: 'MissingNamespacesParameterError'
        })
      }

      next()
    }
  },
  getSingle: {
    inputValidationConfig: [
      sanitizeParam('id').trim(),
      check('id')
        .exists().withMessage('MissingIdParameterError')
        .isInt({ min: 1 }).withMessage('InvalidIdParameterError')
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

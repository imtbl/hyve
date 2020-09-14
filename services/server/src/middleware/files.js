const { param, query, validationResult } = require('express-validator')

const constraintsHelper = require('../util/constraints')

module.exports = {
  get: {
    inputValidationConfig: [
      query('page')
        .trim()
        .exists().withMessage('MissingPageParameterError')
        .isInt({ min: 1 }).withMessage('InvalidPageParameterError'),
      query('tags')
        .optional()
        .isArray({ min: 1 }).withMessage('InvalidTagsParameterError')
        .custom(tags => {
          for (const tag of tags) {
            if (['*', '**', '-', '-*', '-**'].includes(tag)) {
              return false
            }
          }

          return true
        }).withMessage('InvalidTagsParameterError'),
      query('constraints')
        .optional()
        .isArray({ min: 1 }).withMessage('InvalidConstraintsParameterError')
        .custom(constraints => {
          for (const constraint of constraints) {
            if (!constraintsHelper.isValidConstraint(constraint)) {
              return false
            }
          }

          return true
        }).withMessage('InvalidConstraintsParameterError'),
      query('sort')
        .trim()
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
      query('direction')
        .trim()
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('InvalidDirectionParameterError')
        .isIn(['asc', 'desc']).withMessage('InvalidDirectionParameterError'),
      query('namespaces')
        .optional()
        .isArray({ min: 1 }).withMessage('InvalidNamespacesParameterError')
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
      param('id')
        .trim()
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

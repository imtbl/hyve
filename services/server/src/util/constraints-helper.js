const normalDistribution = require('distributions').Normal(0, 1)

const config = require('../config')

const validConstraintExpression =
  /^(id|hash|size|width|height|mime|tags)(=|!=|~=|>|<|><)(([0-9]+(\.?[0-9]+)?(k|m|g)|(0|[1-9]+[0-9]*))(,?[0-9]+(\.?[0-9]+)?(k|m|g)|,?(0|[1-9]+[0-9]*))?|[a-f0-9]{64}|\w+\/[-+.\w]+)$/

module.exports = {
  isValidConstraint (constraint) {
    if (!validConstraintExpression.test(constraint)) {
      return false
    }

    constraint = this.getConstraintParts(constraint)

    switch (constraint.field) {
      case 'id':
      case 'width':
      case 'height':
      case 'tags':
        if (
          !['=', '!=', '~=', '>', '<', '><'].includes(constraint.comparator)
        ) {
          return false
        }

        if (constraint.comparator.includes('><')) {
          const values = constraint.value.split(',')

          if (values.length !== 2) {
            return false
          }

          for (const value of values) {
            if (!this.isValidNumberValue(value)) {
              return false
            }
          }
        } else {
          if (!this.isValidNumberValue(constraint.value)) {
            return false
          }
        }

        break
      case 'size':
        if (
          !['=', '!=', '~=', '>', '<', '><'].includes(constraint.comparator)
        ) {
          return false
        }

        if (constraint.comparator.includes('><')) {
          const values = constraint.value.split(',')

          if (values.length !== 2) {
            return false
          }

          for (const value of values) {
            if (!this.isValidSizeValue(value)) {
              return false
            }
          }
        } else {
          if (!this.isValidSizeValue(constraint.value)) {
            return false
          }
        }

        break
      case 'hash':
        if (!['=', '!='].includes(constraint.comparator)) {
          return false
        }

        if (!this.isValidHashValue(constraint.value)) {
          return false
        }

        break
      case 'mime':
        if (!['=', '!='].includes(constraint.comparator)) {
          return false
        }

        if (!this.isValidMimeValue(constraint.value)) {
          return false
        }

        break
      default:
        return false
    }

    return true
  },
  getConstraintParts (constraint) {
    const parts = validConstraintExpression.exec(constraint)

    return {
      field: parts[1],
      comparator: parts[2],
      value: parts[3]
    }
  },
  isValidNumberValue (value) {
    return /^(0|[1-9]+[0-9]*)$/.exec(value)
  },
  isValidSizeValue (value) {
    return /^([0-9]+(\.?[0-9]+)?(k|m|g)|[1-9]+[0-9]*)$/.exec(value)
  },
  isValidHashValue (value) {
    return /^[a-f0-9]{64}$/.exec(value)
  },
  isValidMimeValue (value) {
    if (!/^\w+\/[-+.\w]+$/.exec(value)) {
      return false
    }

    return this.getMimeId(value) !== null
  },
  getSizeInBytes (value) {
    const prefixes = {
      k: 1024,
      m: Math.pow(1024, 2),
      g: Math.pow(1024, 3)
    }

    let usedPrefix

    for (const key in prefixes) {
      if (Object.prototype.hasOwnProperty.call(prefixes, key)) {
        if (value.includes(key)) {
          usedPrefix = key

          break
        }
      }
    }

    if (!usedPrefix) {
      return value
    }

    return Math.round(
      parseFloat(value.split(usedPrefix)) * prefixes[usedPrefix]
    )
  },
  getMimeId (mime) {
    return Object.keys(config.availableMimeTypes).find(
      key => config.availableMimeTypes[key] === mime
    ) || null
  },
  getDeviance (value) {
    const pdfOfZero = normalDistribution.pdf(0)

    return (pdfOfZero - normalDistribution.pdf(0.618)) * value / pdfOfZero
  }
}

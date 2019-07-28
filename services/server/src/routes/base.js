const router = require('express').Router()

const config = require('../config')

router.get('/', (req, res, next) => {
  res.send({
    hyve: {
      version: config.version,
      apiVersion: config.apiVersion
    }
  })
})

module.exports = router

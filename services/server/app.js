const fs = require('fs')
const path = require('path')
const express = require('express')
const accessLogger = require('morgan')

const config = require('./src/config')
const db = require('./src/db')
const logger = require('./src/util/logger')

const app = express()

try {
  db.connect()
} catch (err) {
  logger.log(
    'Could not connect to the databases. Make sure that the specified paths ' +
      'are correct and that the user running hyve has the requires ' +
      `permissions.\n${err}`,
    'error'
  )

  process.exit(1)
}

if (process.env.NODE_ENV === 'development') {
  app.use(accessLogger('dev'))
} else if (
  process.env.NODE_ENV === 'production' && config.accessLoggingIsEnabled
) {
  const accessLogStream = fs.createWriteStream(
    config.accessLogfilePath, { flags: 'a' }
  )

  accessLogStream.on('error', err => {
    logger.log(
      'Could not write logfile. Make sure that hyve has write access to ' +
        `the specified logfile location or disable logging.\n${err}`,
      'error'
    )

    process.exit(1)
  })

  app.use(accessLogger('combined', { stream: accessLogStream }))
}

app.enable('trust proxy')

app.use(express.json())

app.shuttingDown = false

app.shutDown = server => {
  if (app.shuttingDown) {
    return
  }

  app.shuttingDown = true

  db.close()
  server.close()
}

app.use((req, res, next) => {
  if (!app.shuttingDown) {
    return next()
  }

  res.status(503).json({
    error: 'ShuttingDownError'
  })
})

if (config.crossOriginIsAllowed) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.header('Origin') || '*')

    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )

    res.header(
      'Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE, OPTIONS'
    )

    if (req.method === 'OPTIONS') {
      return res.status(200).send('')
    }

    next()
  })
}

require('./src/routes')(app)

app.use((err, req, res, next) => {
  const syncIsRunning = fs.existsSync(
    path.resolve(path.dirname(config.contentDbPath), '.sync-lock')
  )

  const fallbackErrorStatus = syncIsRunning ? 503 : 500
  const fallbackErrorName = syncIsRunning
    ? 'SyncInProgressError'
    : 'InternalServerError'

  res.status(err.customStatus || fallbackErrorStatus).json({
    error: err.customName || fallbackErrorName
  })
})

app.use((req, res, next) => {
  res.status(404).json({
    error: 'NotFoundError'
  })
})

module.exports = app

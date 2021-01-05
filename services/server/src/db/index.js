const Database = require('better-sqlite3')

const config = require('../config')
const logger = require('../util/logger')

module.exports = {
  connect () {
    this.authentication = new Database(config.authenticationDbPath, {
      fileMustExist: true
    })

    this.content = new Database(config.contentDbPath, {
      fileMustExist: true
    })

    this.setWalMode()
  },
  close () {
    if (this.checkpointInterval) {
      clearInterval(this.checkpointInterval)
    }

    this.authentication.close()
    this.content.close()
  },
  setWalMode () {
    this.authentication.pragma('journal_mode = WAL')
    this.content.pragma('journal_mode = WAL')
  },
  vacuumAuthenticationDb () {
    this.authentication.prepare('VACUUM').run()
  },
  setAuthenticationDbCheckpointInterval () {
    this.checkpointInterval = setInterval(() => {
      try {
        this.authentication.pragma('wal_checkpoint(TRUNCATE)')
      } catch {
        logger.log(
          'Could not checkpoint, will try again in ' +
          `${config.dbCheckpointInterval} seconds.`
        )
      }
    }, config.dbCheckpointInterval * 1000)
  }
}

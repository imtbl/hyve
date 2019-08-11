const Database = require('better-sqlite3')

const config = require('../config')

module.exports = {
  connect () {
    this.hyve = new Database(config.contentDbPath, {
      fileMustExist: true
    })

    this.setWalMode()
    this.addFunctions()
  },
  close () {
    this.hyve.close()
  },
  setWalMode () {
    this.hyve.pragma('journal_mode = WAL')
  },
  addFunctions () {
    this.hyve.function(
      'regexp', (pattern, string) => {
        if (pattern && string) {
          return string.match(new RegExp(pattern)) !== null ? 1 : 0
        }

        return null
      }
    )
  },
  attachHydrusDatabases () {
    this.hyve.prepare(
      `ATTACH '${config.hydrusServerDbPath}' AS hydrus_server_db`
    ).run()
    this.hyve.prepare(
      `ATTACH '${config.hydrusMasterDbPath}' AS hydrus_master_db`
    ).run()
    this.hyve.prepare(
      `ATTACH '${config.hydrusMappingsDbPath}' AS hydrus_mappings_db`
    ).run()
  },
  detachHydrusDatabases () {
    this.hyve.prepare('DETACH hydrus_server_db').run()
    this.hyve.prepare('DETACH hydrus_master_db').run()
    this.hyve.prepare('DETACH hydrus_mappings_db').run()
  }
}

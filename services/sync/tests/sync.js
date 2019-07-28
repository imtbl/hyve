const path = require('path')

const test = require('ava')
const fse = require('fs-extra')

const setup = require('./_setup')

setup.setTestEnvironment()

let app, db

test.before(t => {
  fse.copySync(
    path.resolve(__dirname, 'storage/content.db.template'),
    path.resolve(__dirname, `storage/content.db`)
  )

  app = require('../app')
  db = require('../src/db')

  db.connect()
})

test.serial('sync: run', t => {
  app.runSync()

  db.connect()

  t.deepEqual(
    db.hyve.prepare(
      `SELECT COUNT(*) FROM namespaces
        UNION
      SELECT COUNT(*) FROM tags
        UNION
      SELECT COUNT(*) FROM files
        UNION
      SELECT COUNT(*) FROM mappings`
    ).pluck().all(),
    [1, 5, 10, 20]
  )
})

test.after.always(t => {
  db.close()

  fse.removeSync(path.resolve(__dirname, `storage/content.db`))
  fse.removeSync(path.resolve(__dirname, `storage/content.db-shm`))
  fse.removeSync(path.resolve(__dirname, `storage/content.db-wal`))
})

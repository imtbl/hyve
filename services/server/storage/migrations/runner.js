const fs = require('fs')
const path = require('path')

const Database = require('better-sqlite3')

module.exports = {
  run (dbPath) {
    this.db = new Database(dbPath, {
      fileMustExist: true
    })

    const location = path.resolve(__dirname)

    const migrations = fs.readdirSync(location)
      .map(x => x.match(/^(\d+).(.*?)\.sql$/))
      .filter(x => x !== null)
      .map(x => ({ id: Number(x[1]), name: x[2], filename: x[0] }))
      .sort((a, b) => Math.sign(a.id - b.id))

    if (!migrations.length) {
      return
    }

    migrations.map(migration => {
      const [up, down] = fs.readFileSync(
        path.join(location, migration.filename), 'utf-8'
      ).split(/^--\s+?down\b/mi)

      if (!down) {
        throw new Error(
          `${migration.filename} does not contain '-- Down' separator.`
        )
      } else {
        migration.up = up.replace(/^-- .*?$/gm, '').trim()
        migration.down = down.trim()
      }

      return migration
    })

    this.db.prepare(
      `CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        up TEXT NOT NULL,
        down TEXT NOT NULL
      )`
    ).run()

    let dbMigrations = this.db.prepare(
      'SELECT id, name, up, down FROM migrations ORDER BY id ASC'
    ).all()

    for (
      const migration of dbMigrations.slice().sort(
        (a, b) => Math.sign(b.id - a.id)
      )
    ) {
      if (!migrations.some(x => x.id === migration.id)) {
        this.db.prepare('BEGIN').run()

        try {
          this.db.prepare(migration.down).run()
          this.db.prepare(
            'DELETE FROM migrations WHERE id = ?'
          ).run(migration.id)
          this.db.prepare('COMMIT').run()

          dbMigrations = dbMigrations.filter(x => x.id !== migration.id)

          console.info(`Migrated "${migration.name}" down.`)
        } catch (err) {
          this.db.prepare('ROLLBACK').run()

          throw err
        }
      } else {
        break
      }
    }

    const lastMigrationId = dbMigrations.length
      ? dbMigrations[dbMigrations.length - 1].id
      : 0

    for (const migration of migrations) {
      if (migration.id > lastMigrationId) {
        this.db.prepare('BEGIN').run()

        try {
          this.db.prepare(migration.up).run()
          this.db.prepare(
            'INSERT INTO migrations (id, name, up, down) VALUES (?, ?, ?, ?)'
          ).run(migration.id, migration.name, migration.up, migration.down)
          this.db.prepare('COMMIT').run()

          console.info(`Migrated "${migration.name}" up.`)
        } catch (err) {
          this.db.prepare('ROLLBACK').run()

          throw err
        }
      }
    }
  }
}

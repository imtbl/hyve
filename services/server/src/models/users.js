const upash = require('upash')

const db = require('../db')

upash.install('argon2', require('@phc/argon2'))

module.exports = {
  getById (userId) {
    return db.authentication.prepare(
      `SELECT
        id,
        username,
        password,
        created_at as createdAt,
        updated_at as updatedAt
      FROM
        users
      WHERE
        id = ?`
    ).get(userId)
  },
  getByName (username) {
    return db.authentication.prepare(
      `SELECT
        id,
        username,
        password,
        created_at as createdAt,
        updated_at as updatedAt
      FROM
        users
      WHERE
        username = ?`
    ).get(username)
  },
  async getValid (nameOrId, password, getByName = false) {
    const user = getByName ? this.getByName(nameOrId) : this.getById(nameOrId)

    if (!user) {
      return false
    }

    if (await upash.verify(user.password, password)) {
      return user
    }

    return false
  },
  async create (username, password) {
    const passwordHash = await upash.hash(password)

    const now = Math.floor(Date.now() / 1000)

    const newUserId = db.authentication.prepare(
      `INSERT INTO users (username, password, created_at, updated_at)
      VALUES (?, ?, ?, ?)`
    ).run(username, passwordHash, now, now).lastInsertRowid

    return this.getById(newUserId)
  },
  async update (userId, data) {
    const placeholders = []
    const params = []

    if (data.username) {
      placeholders.push('username = ?')
      params.push(data.username)
    }

    if (data.password) {
      placeholders.push('password = ?')
      params.push(await upash.hash(data.password))
    }

    placeholders.push('updated_at = ?')

    params.push(Math.floor(Date.now() / 1000))
    params.push(userId)

    db.authentication.prepare(
      `UPDATE users SET ${placeholders.join(',')} WHERE id = ?`
    ).run(...params)

    return this.getById(userId)
  },
  delete (userId) {
    db.authentication.prepare('DELETE FROM users WHERE id = ?').run(userId)
  }
}

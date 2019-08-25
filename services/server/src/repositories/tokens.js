const crypto = require('crypto')
const anonymize = require('ip-anonymize')

const db = require('../db')

module.exports = {
  getById (tokenId) {
    return db.authentication.prepare(
      `SELECT
        id,
        user_id AS userId,
        hash,
        media_hash AS mediaHash,
        ip,
        user_agent AS userAgent,
        created_at AS createdAt,
        expires_at AS expiresAt
      FROM
        tokens
      WHERE
        id = ?`
    ).get(tokenId)
  },
  getValidByHash (hash) {
    return db.authentication.prepare(
      `SELECT
        id,
        user_id AS userId,
        hash,
        media_hash AS mediaHash,
        ip,
        user_agent AS userAgent,
        created_at AS createdAt,
        expires_at AS expiresAt
      FROM
        tokens
      WHERE
        hash = ?
      AND
        expires_at > ?`
    ).get(hash, Math.floor(Date.now() / 1000))
  },
  getValidByMediaHash (hash) {
    return db.authentication.prepare(
      `SELECT
        id,
        user_id AS userId,
        hash,
        media_hash AS mediaHash,
        ip,
        user_agent AS userAgent,
        created_at AS createdAt,
        expires_at AS expiresAt
      FROM
        tokens
      WHERE
        media_Hash = ?
      AND
        expires_at > ?`
    ).get(hash, Math.floor(Date.now() / 1000))
  },
  getValidByUserId (userId) {
    return db.authentication.prepare(
      `SELECT
        id,
        user_id AS userId,
        hash,
        media_hash AS mediaHash,
        ip,
        user_agent AS userAgent,
        created_at AS createdAt,
        expires_at AS expiresAt
      FROM
        tokens
      WHERE
        user_id = ?
      AND
        expires_at > ?`
    ).all(userId, Math.floor(Date.now() / 1000))
  },
  async create (userId, ip, userAgent, long = false) {
    const hash = await this.createHash(64)
    const mediaHash = await this.createHash(64)

    const newTokenId = db.authentication.prepare(
      `INSERT INTO tokens (
        user_id, hash, media_hash, ip, user_agent, created_at, expires_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?
      )`
    ).run(
      userId,
      hash,
      mediaHash,
      anonymize(ip, 16, 16),
      userAgent,
      Math.floor(Date.now() / 1000),
      long
        ? Math.floor(Date.now() / 1000) + 7776000
        : Math.floor(Date.now() / 1000) + 86400
    ).lastInsertRowid

    return this.getById(newTokenId)
  },
  delete (userId, hash) {
    db.authentication.prepare(
      `DELETE FROM tokens WHERE ${hash ? 'hash' : 'user_id'} = ?`
    ).run(hash || userId)
  },
  createHash (bytes) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(bytes, (err, buffer) => {
        if (err) {
          reject(err)
        }

        resolve(buffer.toString('hex'))
      })
    })
  }
}

const users = require('../repositories/users')
const tokens = require('../repositories/tokens')

module.exports = {
  getUserById (userId) {
    const user = users.getById(userId)

    return {
      id: user.id,
      username: user.username,
      createdAt: new Date(user.createdAt * 1000),
      updatedAt: new Date(user.updatedAt * 1000)
    }
  },
  getUserByName (username) {
    return users.getByName(username)
  },
  getValidUser (nameOrId, password, getByName = false) {
    if (getByName) {
      return users.getValid(nameOrId, password, true)
    }

    return users.getValid(nameOrId, password)
  },
  async createUser (username, password) {
    const user = await users.create(username, password)

    return {
      id: user.id,
      username: user.username,
      createdAt: new Date(user.createdAt * 1000),
      updatedAt: new Date(user.updatedAt * 1000)
    }
  },
  async updateUser (userId, data) {
    const user = await users.update(userId, data)

    return {
      id: user.id,
      username: user.username,
      createdAt: new Date(user.createdAt * 1000),
      updatedAt: new Date(user.updatedAt * 1000)
    }
  },
  deleteUser (userId) {
    users.delete(userId)
  },
  getTokens (userId) {
    return tokens.getValidByUserId(userId).map(token => ({
      token: token.hash,
      mediaToken: token.mediaHash,
      ip: token.ip,
      userAgent: token.userAgent,
      createdAt: new Date(token.createdAt * 1000),
      expiresAt: new Date(token.expiresAt * 1000)
    }))
  },
  async createToken (userId, ip, userAgent, long) {
    const token = await tokens.create(userId, ip, userAgent, long)

    return {
      token: token.hash,
      mediaToken: token.mediaHash,
      ip: token.ip,
      userAgent: token.userAgent,
      createdAt: new Date(token.createdAt * 1000),
      expiresAt: new Date(token.expiresAt * 1000)
    }
  },
  deleteTokens (userId, hash, all) {
    if (all) {
      tokens.delete(userId)

      return
    }

    tokens.delete(userId, hash)
  },
  validateTokenAndGetUserId (hash) {
    const token = tokens.getValidByHash(hash)

    if (!token) {
      return false
    }

    return users.getById(token.userId).id
  },
  isValidMediaToken (hash) {
    return tokens.getValidByMediaHash(hash) !== null
  }
}

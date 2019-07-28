const path = require('path')

const test = require('ava')
const fse = require('fs-extra')

const setup = require('./_setup')
const migrations = require('../storage/migrations/runner')

setup.setTestEnvironment()

let db, users, tokens, tags, files

let originalBaseUrl, thumbnailsBaseUrl, testToken

test.before(t => {
  const mediaBaseUrl = 'http://localhost/media'
  originalBaseUrl = `${mediaBaseUrl}/original`
  thumbnailsBaseUrl = `${mediaBaseUrl}/thumbnails`

  fse.copySync(
    path.resolve(__dirname, 'storage/authentication.db.template'),
    path.resolve(__dirname, `storage/authentication.db`)
  )

  fse.copySync(
    path.resolve(__dirname, 'storage/content.db.template'),
    path.resolve(__dirname, `storage/content.db`)
  )

  migrations.run(process.env.HYVE_AUTHENTICATION_DB_PATH)

  db = require('../src/db')
  users = require('../src/models/users')
  tokens = require('../src/models/tokens')
  tags = require('../src/models/tags')
  files = require('../src/models/files')

  db.connect()
})

test.serial('Database: Create user', async t => {
  await users.create('johndoe', '0123456789abcdef')

  t.truthy(users.getById(1).username === 'johndoe')
})

test.serial('Database: Update user', async t => {
  await users.update(
    1, { username: 'johndoes', password: 'abcdef0123456789' }
  )

  t.truthy(users.getById(1).username === 'johndoes')
})

test.serial('Database: Create token', async t => {
  testToken = await tokens.create(1, '127.0.0.1', 'test')

  t.truthy(testToken.hash.length === 128 && testToken.mediaHash.length === 128)
})

test.serial('Database: Get tokens', async t => {
  t.deepEqual(tokens.getValidByUserId(1), [testToken])
})

test.serial('Database: Delete token', t => {
  tokens.delete(1, testToken.hash)

  t.truthy(!tokens.getValidByHash(testToken.hash))
})

test.serial('Database: Delete user', t => {
  users.delete(1)

  t.truthy(!users.getById(1))
})

test('Database: Get tags', t => {
  t.deepEqual(
    tags.get(1),
    {
      tags: [
        { name: 'namespace:e', fileCount: 1 },
        { name: 'namespace:d', fileCount: 1 },
        { name: 'namespace:c', fileCount: 1 },
        { name: 'namespace:b', fileCount: 1 }
      ]
    }
  )
})

test('Database: Get tags sorted ascending', t => {
  t.deepEqual(
    tags.get(1, 'id', 'asc'),
    {
      tags: [
        { name: 'lorem', fileCount: 5 },
        { name: 'ipsum', fileCount: 4 },
        { name: 'dolor', fileCount: 3 },
        { name: 'sit', fileCount: 2 }
      ]
    }
  )
})

test('Database: Get tags sorted by name', t => {
  t.deepEqual(
    tags.get(1, 'name'),
    {
      tags: [
        { name: 'amet', fileCount: 1 },
        { name: 'dolor', fileCount: 3 },
        { name: 'ipsum', fileCount: 4 },
        { name: 'lorem', fileCount: 5 }
      ]
    }
  )
})

test('Database: Get tags sorted by name descending', t => {
  t.deepEqual(
    tags.get(1, 'name', 'desc'),
    {
      tags: [
        { name: 'sit', fileCount: 2 },
        { name: 'namespace:e', fileCount: 1 },
        { name: 'namespace:d', fileCount: 1 },
        { name: 'namespace:c', fileCount: 1 }
      ]
    }
  )
})

test('Database: Get tags sorted by file count', t => {
  t.deepEqual(
    tags.get(1, 'files'),
    {
      tags: [
        { name: 'lorem', fileCount: 5 },
        { name: 'ipsum', fileCount: 4 },
        { name: 'dolor', fileCount: 3 },
        { name: 'sit', fileCount: 2 }
      ]
    }
  )
})

test('Database: Get tags sorted by file count ascending', t => {
  t.deepEqual(
    tags.get(1, 'files', 'asc'),
    {
      tags: [
        { name: 'amet', fileCount: 1 },
        { name: 'namespace:a', fileCount: 1 },
        { name: 'namespace:b', fileCount: 1 },
        { name: 'namespace:c', fileCount: 1 }
      ]
    }
  )
})

test('Database: Get tags containing', t => {
  t.deepEqual(
    tags.getContaining(1, 'lor'),
    {
      tags: [
        { name: 'dolor', fileCount: 3 },
        { name: 'lorem', fileCount: 5 }
      ]
    }
  )
})

test('Database: Get tags containing sorted ascending', t => {
  t.deepEqual(
    tags.getContaining(1, 'lor', 'id', 'asc'),
    {
      tags: [
        { name: 'lorem', fileCount: 5 },
        { name: 'dolor', fileCount: 3 }
      ]
    }
  )
})

test('Database: Get tags containing sorted by name', t => {
  t.deepEqual(
    tags.getContaining(1, 'lor', 'name'),
    {
      tags: [
        { name: 'dolor', fileCount: 3 },
        { name: 'lorem', fileCount: 5 }
      ]
    }
  )
})

test('Database: Get tags containing sorted by name descending', t => {
  t.deepEqual(
    tags.getContaining(1, 'lor', 'name', 'desc'),
    {
      tags: [
        { name: 'lorem', fileCount: 5 },
        { name: 'dolor', fileCount: 3 }
      ]
    }
  )
})

test('Database: Get tags containing sorted by file count', t => {
  t.deepEqual(
    tags.getContaining(1, 'lor', 'files'),
    {
      tags: [
        { name: 'lorem', fileCount: 5 },
        { name: 'dolor', fileCount: 3 }
      ]
    }
  )
})

test('Database: Get tags containing sorted by file count ascending', t => {
  t.deepEqual(
    tags.getContaining(1, 'lor', 'files', 'asc'),
    {
      tags: [
        { name: 'dolor', fileCount: 3 },
        { name: 'lorem', fileCount: 5 }
      ]
    }
  )
})

test('Database: Get tags containing sorted by contains', t => {
  t.deepEqual(
    tags.getContaining(1, 'lor', 'contains'),
    {
      tags: [
        { name: 'lorem', fileCount: 5 },
        { name: 'dolor', fileCount: 3 }
      ]
    }
  )
})

test('Database: Get tags containing sorted by contains descending', t => {
  t.deepEqual(
    tags.getContaining(1, 'lor', 'contains', 'desc'),
    {
      tags: [
        { name: 'lorem', fileCount: 5 },
        { name: 'dolor', fileCount: 3 }
      ]
    }
  )
})

test('Database: Get tags of file', t => {
  t.deepEqual(
    tags.getOfFile(1),
    [
      { name: 'amet', fileCount: 1 },
      { name: 'dolor', fileCount: 3 },
      { name: 'ipsum', fileCount: 4 },
      { name: 'lorem', fileCount: 5 },
      { name: 'namespace:e', fileCount: 1 },
      { name: 'sit', fileCount: 2 }
    ]
  )
})

test('Database: Tag autocompletion', t => {
  t.deepEqual(
    tags.complete('lor'),
    [
      { name: 'lorem', fileCount: 5 },
      { name: 'dolor', fileCount: 3 }
    ]
  )
})

test('Database: Get namespaces', t => {
  t.deepEqual(
    tags.getNamespaces(),
    [{ name: 'namespace' }]
  )
})

test('Database: Get total tag count', t => {
  t.deepEqual(
    tags.getTotalCount(),
    10
  )
})

test('Database: Get files', t => {
  t.deepEqual(
    files.get(1),
    {
      files: [
        {
          id: 5,
          hash:
            'd2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          mime: 'image/png',
          size: 6672,
          width: 500,
          height: 500,
          tagCount: 2,
          mediaUrl: originalBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          thumbnailUrl: thumbnailsBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        }
      ]
    }
  )
})

test('Database: Get files sorted ascending', t => {
  t.deepEqual(
    files.get(1, 'id', 'asc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by size', t => {
  t.deepEqual(
    files.get(1, 'size'),
    {
      files: [
        {
          id: 5,
          hash:
            'd2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          mime: 'image/png',
          size: 6672,
          width: 500,
          height: 500,
          tagCount: 2,
          mediaUrl: originalBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          thumbnailUrl: thumbnailsBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        }
      ]
    }
  )
})

test('Database: Get files sorted by size ascending', t => {
  t.deepEqual(
    files.get(1, 'size', 'asc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by width', t => {
  t.deepEqual(
    files.get(1, 'width'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by width descending', t => {
  t.deepEqual(
    files.get(1, 'width', 'desc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by height', t => {
  t.deepEqual(
    files.get(1, 'height'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by height ascending', t => {
  t.deepEqual(
    files.get(1, 'height', 'asc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by mime', t => {
  t.deepEqual(
    files.get(1, 'mime'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by mime descending', t => {
  t.deepEqual(
    files.get(1, 'mime', 'desc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by tag count', t => {
  t.deepEqual(
    files.get(1, 'tags'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by tag count ascending', t => {
  t.deepEqual(
    files.get(1, 'tags', 'asc'),
    {
      files: [
        {
          id: 5,
          hash:
            'd2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          mime: 'image/png',
          size: 6672,
          width: 500,
          height: 500,
          tagCount: 2,
          mediaUrl: originalBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          thumbnailUrl: thumbnailsBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        }
      ]
    }
  )
})

test('Database: Get files sorted by namespace', t => {
  t.deepEqual(
    files.get(1, 'namespaces', null, ['namespace']),
    {
      files: [
        {
          id: 5,
          hash:
            'd2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          mime: 'image/png',
          size: 6672,
          width: 500,
          height: 500,
          tagCount: 2,
          mediaUrl: originalBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          thumbnailUrl: thumbnailsBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        }
      ]
    }
  )
})

test('Database: Get files sorted by namespace descending', t => {
  t.deepEqual(
    files.get(1, 'namespaces', 'desc', ['namespace']),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        }
      ]
    }
  )
})

test('Database: Get files sorted by invalid namespace', t => {
  t.deepEqual(
    files.get(1, 'namespaces', null, ['invalid']),
    {
      files: [
        {
          id: 5,
          hash:
            'd2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          mime: 'image/png',
          size: 6672,
          width: 500,
          height: 500,
          tagCount: 2,
          mediaUrl: originalBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          thumbnailUrl: thumbnailsBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        }
      ]
    }
  )
})

test('Database: Get files by tags', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor', 'sit', 'amet']),
    {
      files: [{
        id: 1,
        hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
        mime: 'image/png',
        size: 5012,
        width: 500,
        height: 500,
        tagCount: 6,
        mediaUrl: originalBaseUrl +
          '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
        thumbnailUrl: thumbnailsBaseUrl +
          '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
      }]
    }
  )
})

test('Database: Get files by excluded tags', t => {
  t.deepEqual(
    files.getByTags(1, ['-sit', '-amet']),
    {
      files: [
        {
          id: 5,
          hash:
            'd2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          mime: 'image/png',
          size: 6672,
          width: 500,
          height: 500,
          tagCount: 2,
          mediaUrl: originalBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d',
          thumbnailUrl: thumbnailsBaseUrl +
            '/d2f5788f623cde1f0fb3dc801396fee235c67ed11d9452bfd765f1331587401d'
        },
        {
          id: 4,
          hash:
            '6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          mime: 'image/png',
          size: 6665,
          width: 500,
          height: 500,
          tagCount: 3,
          mediaUrl: originalBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39',
          thumbnailUrl: thumbnailsBaseUrl +
            '/6c358705afeeeb6b75ba725cba10145ae366b6c36fe79aa99c983d354926af39'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags and excluded tags', t => {
  t.deepEqual(
    files.getByTags(1, ['dolor', '-sit', '-amet']),
    {
      files: [{
        id: 3,
        hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
        mime: 'image/png',
        size: 6117,
        width: 500,
        height: 500,
        tagCount: 4,
        mediaUrl: originalBaseUrl +
          '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
        thumbnailUrl: thumbnailsBaseUrl +
          '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
      }]
    }
  )
})

test('Database: Get files by tags sorted ascending', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor', 'sit', 'amet'], 'id', 'asc'),
    {
      files: [{
        id: 1,
        hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
        mime: 'image/png',
        size: 5012,
        width: 500,
        height: 500,
        tagCount: 6,
        mediaUrl: originalBaseUrl +
          '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
        thumbnailUrl: thumbnailsBaseUrl +
          '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
      }]
    }
  )
})

test('Database: Get files by tags sorted by size', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'size'),
    {
      files: [
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by size ascending', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'size', 'asc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by width', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'width'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by width ascending', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'width', 'asc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by height', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'height'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by height descending', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'height', 'desc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by mime', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'mime'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by mime descending', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'mime', 'desc'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by tag count', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'tags'),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by tag count ascending', t => {
  t.deepEqual(
    files.getByTags(1, ['lorem', 'ipsum', 'dolor'], 'tags', 'asc'),
    {
      files: [
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by namespace', t => {
  t.deepEqual(
    files.getByTags(
      1, ['lorem', 'ipsum', 'dolor'], 'namespaces', null, ['namespace']
    ),
    {
      files: [
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by namespace descending', t => {
  t.deepEqual(
    files.getByTags(
      1, ['lorem', 'ipsum', 'dolor'], 'namespaces', 'desc', ['namespace']
    ),
    {
      files: [
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        }
      ]
    }
  )
})

test('Database: Get files by tags sorted by invalid namespace', t => {
  t.deepEqual(
    files.getByTags(
      1, ['lorem', 'ipsum', 'dolor'], 'namespaces', null, ['invalid']
    ),
    {
      files: [
        {
          id: 3,
          hash:
            '31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          mime: 'image/png',
          size: 6117,
          width: 500,
          height: 500,
          tagCount: 4,
          mediaUrl: originalBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42',
          thumbnailUrl: thumbnailsBaseUrl +
            '/31426ccc8101461ad30806840b29432fb88bb84687ef9e002976551c8aa08e42'
        },
        {
          id: 2,
          hash:
            '5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          mime: 'image/png',
          size: 5779,
          width: 500,
          height: 500,
          tagCount: 5,
          mediaUrl: originalBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55',
          thumbnailUrl: thumbnailsBaseUrl +
            '/5ef2eac48dd171cf98793df1e123238a61fb8ed766e862042b25467066fabe55'
        },
        {
          id: 1,
          hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          mime: 'image/png',
          size: 5012,
          width: 500,
          height: 500,
          tagCount: 6,
          mediaUrl: originalBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
          thumbnailUrl: thumbnailsBaseUrl +
            '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
        }
      ]
    }
  )
})

test('Database: Get file by id', t => {
  t.deepEqual(
    files.getById(1),
    {
      id: 1,
      hash:
            '2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
      mime: 'image/png',
      size: 5012,
      width: 500,
      height: 500,
      tagCount: 6,
      mediaUrl: originalBaseUrl +
        '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c',
      thumbnailUrl: thumbnailsBaseUrl +
        '/2acedf8e20512a10fc07cceca8d16923e790369b90acebf9efcd926f50dd5c0c'
    }
  )
})

test('Database: Get mime types', t => {
  t.deepEqual(
    files.getMimeTypes(),
    [{ name: 'image/png' }]
  )
})

test('Database: Get total file count', t => {
  t.deepEqual(
    files.getTotalCount(),
    5
  )
})

test.after.always(t => {
  db.close()

  fse.removeSync(path.resolve(__dirname, `storage/authentication.db`))
  fse.removeSync(path.resolve(__dirname, `storage/authentication.db-shm`))
  fse.removeSync(path.resolve(__dirname, `storage/authentication.db-wal`))
  fse.removeSync(path.resolve(__dirname, `storage/content.db`))
  fse.removeSync(path.resolve(__dirname, `storage/content.db-shm`))
  fse.removeSync(path.resolve(__dirname, `storage/content.db-wal`))
})

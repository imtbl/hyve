import config from '@/config'

export function getTagColor (tag, colors) {
  if (!colors.length) {
    return config.fallbackNamespaceColor
  }

  if (!tag.includes(':')) {
    return colors.find(color => color.name === 'unnamespaced').color
  }

  const available = colors.find(
    color => color.name === tag.split(':')[0]
  )

  return available
    ? available.color
    : colors.find(color => color.name === 'unnamespaced').color
}

export function getSortedTags (tags, resortUnnamespacedTags = false) {
  const namespacedTags = []

  for (let i = 0; i < tags.length; i++) {
    if (
      !tags[i].name.startsWith(':') &&
      !tags[i].name.endsWith(':') &&
      tags[i].name.includes(':')
    ) {
      namespacedTags.push(tags[i])
      tags[i] = ''
    }
  }

  tags = tags.filter(tag => tag !== '')

  if (resortUnnamespacedTags) {
    tags.sort((a, b) => a.name.localeCompare(b.name))
  }

  return namespacedTags.concat(tags)
}

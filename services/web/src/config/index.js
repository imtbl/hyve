const generateNamespaceColors = environmentVariable => {
  const colors = [{
    name: 'unnamespaced',
    color: process.env.VUE_APP_HYVE_FALLBACK_NAMESPACE_COLOR || '#0088fb'
  }]

  for (const color of environmentVariable.split('|')) {
    const splitColor = color.split('#').map(property => property.trim())

    if (splitColor[0] === '' || !/^#[0-9a-f]{6}$/i.test(`#${splitColor[1]}`)) {
      continue
    }

    colors.push({
      name: splitColor[0],
      color: `#${splitColor[1]}`
    })
  }

  return colors
}

export default {
  version: '2.12.0',
  title: process.env.VUE_APP_HYVE_TITLE,
  subtitle: process.env.VUE_APP_HYVE_SUBTITLE,
  useNormalLetterCase:
    process.env.VUE_APP_HYVE_USE_NORMAL_LETTER_CASE === 'true',
  showLogo: process.env.VUE_APP_HYVE_SHOW_LOGO === 'true',
  showTagCloud: process.env.VUE_APP_HYVE_SHOW_TAG_CLOUD === 'true',
  ipfsGatewayBaseUrl:
    process.env.VUE_APP_IPFS_GATEWAY_BASE_URL || 'https://ipfs.io/ipfs/',
  apiUrl: process.env.VUE_APP_HYVE_API_URL,
  isRegistrationEnabled:
    process.env.VUE_APP_HYVE_REGISTRATION_ENABLED === 'true',
  isAuthenticationRequired: process.env.VUE_APP_HYVE_AUTHENTICATION_REQUIRED
    ? process.env.VUE_APP_HYVE_AUTHENTICATION_REQUIRED === 'true'
    : true,
  minPasswordLength: process.env.VUE_APP_HYVE_MIN_PASSWORD_LENGTH || 16,
  countsAreEnabled: process.env.VUE_APP_HYVE_COUNTS_ENABLED === 'true',
  fallbackFilesSortingNamespace:
    process.env.VUE_APP_HYVE_FALLBACK_FILES_SORTING_NAMESPACE || 'namespace',
  defaultNamespaceColors: generateNamespaceColors(
    process.env.VUE_APP_HYVE_DEFAULT_NAMESPACE_COLORS
  ),
  fallbackNamespaceColor:
    process.env.VUE_APP_HYVE_FALLBACK_NAMESPACE_COLOR || '#0088fb',
  mimeTypes: {
    1: 'image/jpeg',
    2: 'image/png',
    3: 'image/gif',
    4: 'image/bmp',
    9: 'video/x-flv',
    14: 'video/mp4',
    18: 'video/x-ms-wmv',
    20: 'video/x-matroska',
    21: 'video/webm',
    23: 'image/apng',
    25: 'video/mpeg',
    26: 'video/quicktime',
    27: 'video/x-msvideo'
  }
}

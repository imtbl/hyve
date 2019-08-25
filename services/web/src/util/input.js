import { isValidConstraint } from '@/util/constraints'

export function isValidFileSearchInput (input, ignoreShortcuts) {
  return !['', '-', '**', '-', '-**', ...(ignoreShortcuts ? [] : ['*', '-*'])]
    .includes(input.trim())
}

export function transformFileSearchInput (input) {
  input = input.trim()

  switch (input) {
    case '*':
      return 'tags>0'
    case '-*':
      return 'tags=0'
  }

  const lowerCasedInput = input.toLowerCase()

  if (!lowerCasedInput.startsWith('ipfs')) {
    return lowerCasedInput
  }

  const inputParts = input.split('=')
  const assumedIpfsConstraint =
    `${inputParts[0].toLowerCase()}=${inputParts[1]}`

  return isValidConstraint(assumedIpfsConstraint)
    ? assumedIpfsConstraint
    : lowerCasedInput
}

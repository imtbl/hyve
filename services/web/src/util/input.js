export function isValidFileSearchInput (input, ignoreShortcuts) {
  return !['', '-', '**', '-', '-**', ...(ignoreShortcuts ? [] : ['*', '-*'])]
    .includes(input.trim())
}

export function convertToShortcutIfNecessary (input) {
  return input === '*'
    ? 'tags>0'
    : input === '-*'
      ? 'tags=0'
      : input
}

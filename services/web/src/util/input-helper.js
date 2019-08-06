export default {
  isValidFileSearchInput (input, ignoreShortcuts) {
    return !['', '-', '**', '-', '-**', ...(ignoreShortcuts ? [] : ['*', '-*'])]
      .includes(input.trim())
  },
  convertToShortcutIfNecessary (input) {
    return input === '*'
      ? 'tags>0'
      : input === '-*'
        ? 'tags=0'
        : input
  }
}

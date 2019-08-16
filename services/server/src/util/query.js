module.exports = {
  escapeSpecialCharacters (text) {
    return text
      .split('^')
      .join('^^')
      .split('%')
      .join('^%')
      .split('_')
      .join('^_')
  }
}

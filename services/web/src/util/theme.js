export function setTheme (useDarkTheme) {
  if (useDarkTheme) {
    document.body.classList.add('dark')

    return
  }

  document.body.classList.remove('dark')
}

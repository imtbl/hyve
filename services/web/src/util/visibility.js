export function isDesktopResolution () {
  return window.matchMedia('(min-width: 1088px)').matches
}

export function isBottomOfPageVisible (offset = 0) {
  const scrollY = window.scrollY
  const isVisible = document.documentElement.clientHeight
  const pageHeight = document.documentElement.scrollHeight
  const isAtBottomOfPage = (isVisible + scrollY) >= (pageHeight - offset)

  return isAtBottomOfPage || ((pageHeight - offset) < isVisible)
}

export function isPageScrolledPastElement (elementId) {
  if (!elementId) {
    return false
  }

  const element = document.getElementById(elementId)

  return element
    ? element.getBoundingClientRect().bottom +
      parseInt(window.getComputedStyle(element).marginBottom) <
      document.getElementById('navbar').offsetHeight
    : false
}

module.exports = {
  log (message, type = 'info') {
    switch (type) {
      case 'error':
        console.error(`${new Date().toLocaleString()}:`, message)

        break
      default:
        console.info(`${new Date().toLocaleString()}:`, message)
    }
  }
}

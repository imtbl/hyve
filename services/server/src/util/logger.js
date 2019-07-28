module.exports = {
  log (message, type = 'info') {
    switch (type) {
      case 'error':
        console.error(`${this.getTime()}:`, message)

        break
      default:
        console.info(`${this.getTime()}:`, message)
    }
  },
  getTime () {
    return new Date().toLocaleString()
  }
}

module.exports = {
  init () {
    this.t0 = process.hrtime()
    this.t1 = this.t0
  },
  differential () {
    const result = this.formatTime(process.hrtime(this.t1))

    this.t1 = process.hrtime()

    return result
  },
  cumulative () {
    return this.formatTime(process.hrtime(this.t0))
  },
  formatTime (hrtime) {
    let ms = Math.trunc(hrtime[1] * 1e-6)
    ms = new Array(3).concat([ms]).join('0').slice(-3)

    return `${hrtime[0]}.${ms}s`
  },
  log (message) {
    if (!message) {
      this.differential()

      return
    }

    process.stdout.write(
      message
        .replace('{datetime}', (new Date().toLocaleString()))
        .replace('{dt}', this.differential())
        .replace('{t}', this.cumulative())
    )
  }
}

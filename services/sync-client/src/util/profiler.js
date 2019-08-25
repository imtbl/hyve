let t0, t1

function init () {
  t0 = process.hrtime()
  t1 = t0
}

function differential () {
  const result = formatTime(process.hrtime(t1))

  t1 = process.hrtime()

  return result
}

function cumulative () {
  return formatTime(process.hrtime(t0))
}

function formatTime (hrtime) {
  let ms = Math.trunc(hrtime[1] * 1e-6)
  ms = new Array(3).concat([ms]).join('0').slice(-3)

  return `${hrtime[0]}.${ms}s`
}

function log (message) {
  if (!message) {
    differential()

    return
  }

  process.stdout.write(
    message
      .replace('{datetime}', (new Date().toLocaleString()))
      .replace('{dt}', differential())
      .replace('{t}', cumulative())
  )
}

module.exports = {
  init,
  log
}

var util = {}
module.exports = util
util.now = now

function now () {
  return new Date().toISOString()
}

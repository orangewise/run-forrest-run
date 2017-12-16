var d = require('debug')('cli')
var fs = require('fs')
var join = require('path').join
var pkg = require('../package.json')
var minimist = require('minimist')

var cli = {}
cli.usage = usage
cli.parse = parse
module.exports = cli

function parse () {
  var opts = minimist(process.argv.slice(2))
  d('opts', opts)
  if (opts.c) {
    return opts
  } else {
    info()
    console.log(usage())
  }
}

function usage () {
  return fs.readFileSync(join(__dirname, '..', 'bin', 'usage.txt'), 'utf8')
}

function info () {
  console.log(`\n${pkg.name} (${pkg.version})\n`)
  console.log(pkg.description)
}

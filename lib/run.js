var d = require('debug')('run')
var yaml = require('./yaml')
var util = require('./util')
var os = require('os')
var fs = require('fs')
var spawn = require('child_process').spawn
var parallelLimit = require('run-parallel-limit')
var PARALLEL_LIMIT = os.cpus().length

var run = {}
module.exports = run
run.scripts = scripts

var verbose

function scripts (options, cb) {
  d('scripts', options.c)
  verbose = options.v || false
  log('************************')
  log(`${util.now()} forrest starts running scripts`)
  log('************************')
  yaml.fileContents(options.c, function (e, scripts) {
    if (e) {
      if (cb) return cb(e)
      log(e)
      process.exit(1)
    }
    var opts = Object.assign(options, scripts.options)
    d(opts)
    start(opts, scripts.start, cb)
  })
}

function start (options, start, cb) {
  // sequential or parallel
  var limit = (start.flow === 'sequential') ? 1 : PARALLEL_LIMIT
  d(`start ${start.name} ${limit} in parallel: ${JSON.stringify(start)}`)
  var exit = 0
  parallelLimit(
    start.steps.map(function (step) {
      var msg = `${util.now()} start    : script ${step.name} ${step.script}`
      return function (cb) {
        return task(step, function (e, r) {
          if (e) {
            exit++
            log(fs.readFileSync(step.output_file, 'utf8'))
          }
          log(msg)
          log(`${util.now()} finished : script ${step.name} ${step.script}`)
          cb(null, exit)
        })
      }
    }),
    limit,
    function (e, r) {
      var exit = r.reduce((a, b) => a + b, 0)
      log('************************')
      if (exit > 0) {
        log(`${util.now()} some steps errored, please check the log ^^`)
      } else {
        log(`${util.now()} all steps of "${start.name}" ran successfully`)
      }
      log('************************')
      if (cb) return cb(null, exit)
    })
}

function task (step, cb) {
  d('task', step)
  var opts = {}
  if (step.script) {
    // simple task
    opts.log = step.output_file
    processSpawn(step.script, [], opts, function (err) {
      if (err) err.message += ` task error `
      cb(err, step)
    })
  } else {
    // start the flow for nested steps
    start(opts, step, cb)
  }
}

function processSpawn (command, args, opts, cb) {
  opts.env = process.env
  var child = spawn(command, args, opts)
  child.stdout.pipe(fs.createWriteStream(opts.log))
  child.on('error', cb)
  child.on('close', function (code) {
    if (code !== 0) return cb(new Error('non-zero exit code: ' + code))
    cb(null)
  })
  return child
}

function log () {
  if (verbose) console.log.apply(console, arguments)
}

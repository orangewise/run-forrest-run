var d = require('debug')
var yaml = require('./yaml')
var util = require('./util')
var os = require('os')
var fs = require('fs')
var rimraf = require('rimraf')
var join = require('path').join
var spawn = require('child_process').spawn
var parallelLimit = require('run-parallel-limit')
var PARALLEL_LIMIT = os.cpus().length

var run = {}
module.exports = run
run.scripts = scripts

var verbose

function scripts (options, cb) {
  rimraf(join(process.cwd(), 'log', '*.log'), function (e, r) {
    runScripts(options, cb)
  })
}

function runScripts (options, cb) {
  d('run-scripts')(`config ${options.c}`)
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
    var opts = Object.assign({}, options, scripts.options)
    start(opts, scripts.start, cb)
  })
}

function start (options, start, cb) {
  // sequential or parallel
  var limit = (start.flow === 'sequential') ? 1 : PARALLEL_LIMIT
  d('run-start')(`start ${start.name} ${limit} in parallel: ${JSON.stringify(start)}`)
  var exit = 0
  parallelLimit(
    start.steps.map(function (step) {
      return function (cb) {
        var opts = {}
        opts.retry_count = step.retry_count || options.retry_count
        opts.env = step.env || options.env
        d('run-start')(`opts.env ${JSON.stringify(opts.env)}`)
        var msg = `${util.now()} start    : script ${step.name} ${step.script}`
        return task(step, opts, function (e, r) {
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

function task (step, options, cb) {
  d('run-task')('task', step)
  var opts = Object.assign({}, options)
  if (step.script) {
    // simple task
    opts.log = step.output_file || `${step.name}.log`
    processSpawn(step.script, step.arguments, opts, function (err) {
      if (err) err.message += ` task error `
      cb(err, step)
    })
  } else {
    // start the flow for nested steps
    start(opts, step, cb)
  }
}

function processSpawn (command, args, options, cb) {
  var opts = Object.assign({}, options)
  d('run-processSpawn')('env', opts.env)
  var child = spawn(command, args, opts)
  child.stdout.pipe(fs.createWriteStream(opts.log))
  child.on('error', cb)
  child.on('close', function (code) {
    if (code !== 0) return cb(new Error('non-zero exit code: ' + code))
    cb(null)
  })
}

function log () {
  if (verbose) console.log.apply(console, arguments)
}

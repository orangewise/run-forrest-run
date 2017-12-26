var d = require('debug')
var os = require('os')
var fs = require('fs')
var rimraf = require('rimraf')
var path = require('path')
var join = path.join
var spawn = require('child_process').spawn
var parallelLimit = require('run-parallel-limit')
var $RefParser = require('json-schema-ref-parser')

var verbose
var run = {}
module.exports = run
run.scripts = scripts

function scripts (options, cb) {
  rimraf(join(process.cwd(), 'log', '*.log'), function (e, r) {
    runScripts(options, cb)
  })
}

function runScripts (options, cb) {
  d('run-scripts')(`config ${options.c}`)
  verbose = options.v || false
  log('************************')
  log(`${now()} forrest starts running scripts`)
  log('************************')
  $RefParser.dereference(options.c, function (e, scripts) {
    if (e) {
      if (cb) return cb(e)
    }
    var opts = Object.assign({}, options, scripts.options)
    d('run-scripts-options')(`${JSON.stringify(scripts.options)}`)
    start(opts, scripts.start, cb)
  })
}

function start (options, start, cb) {
  // sequential or parallel
  var cpuCount = os.cpus().length
  var limit = (start.flow === 'sequential') ? 1 : options.limit || cpuCount
  log(`${now()} start "${start.name}" ${limit} process(es) in parallel`)
  var exit = 0
  var steps = start.steps || []
  parallelLimit(
    steps.map(function (step) {
      return function (cb) {
        var opts = {}
        opts.env = step.env || options.env || {}
        opts.env = Object.assign(opts.env, process.env)
        opts.cwd = step.cwd || options.cwd || process.cwd()
        opts.retry_count = step.retry_count || options.retry_count || 0
        opts.count = 1
        d('run-start')(`opts.env ${JSON.stringify(opts.env)}`)
        var msg = `${now()} start    : script of step "${step.name}"`
        return task(step, opts, function (e) {
          if (e) {
            exit++
          }
          log(msg)
          log(`${now()} finished : script "${step.name}" ${step.script}`)
          cb(null, exit)
        })
      }
    }),
    limit,
    function (e, r) {
      var exit = r.reduce((a, b) => a + b, 0)
      log('************************')
      if (exit > 0) {
        log(`${now()} some steps errored, please check the log ^^ [${exit}]`)
      } else {
        log(`${now()} all ${steps.length} steps of "${start.name}" ran successfully`)
      }
      log('************************')
      if (cb) return cb(null, exit)
    })
}

// recursive task function
function task (step, options, cb) {
  d('run-task')(step)
  d('run-task-cwd')(`process.cwd ${process.cwd()}`)
  var opts = Object.assign({}, options)
  if (step.script) {
    // simple task
    opts.log = logFile(step, options.count)
    var args = step.arguments || []
    d('run-task-script')(step.script, args)
    processSpawn(step.script, args, opts, function (err) {
      if (err) {
        err.message += ` task error `
        log(`${now()} attempt ${opts.count} of ${opts.retry_count}`)
        // show the error from the log
        log(fs.readFileSync(logFile(step, opts.count), 'utf8'))
        // show the error from the callback
        log(`err: ${err}`)
        if (opts.count < opts.retry_count) {
          opts.count++
          task(step, opts, cb)
        } else {
          cb(err)
        }
      } else {
        cb()
      }
    })
  } else {
    // start the flow for nested steps
    start(opts, step, cb)
  }
}

function processSpawn (command, args, options, cb) {
  var opts = Object.assign({}, options)
  d('run-processSpawn-env')(opts.env)
  d('run-processSpawn-cwd')(opts.cwd)
  var child = spawn(command, args, { cwd: opts.cwd, env: opts.env })
  child.stdout.pipe(fs.createWriteStream(opts.log))
  child.stderr.pipe(fs.createWriteStream(opts.log))
  child.on('error', cb)
  child.on('close', function (code) {
    if (code !== 0) return cb(new Error('non-zero exit code: ' + code))
    cb(null)
  })
}

function logFile (step, count) {
  var filename = step.output_file || `${step.name}.log`
  var dir = path.dirname(filename)
  var ext = path.extname(filename)
  var basename = path.basename(filename, ext)
  filename = join(dir, `${basename}.${count}${ext}`)
  return filename
}

function log () {
  if (verbose) console.log.apply(console, arguments)
}

function now () {
  return new Date().toISOString()
}

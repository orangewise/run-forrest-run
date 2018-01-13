var test = require('tape')
var run = require('../lib/run')
var join = require('path').join
var fs = require('fs')

test('scripts without errors', function (t) {
  t.plan(8)
  run.scripts({ c: join(__dirname, 'fixtures', 'scripts.yaml'), v: false }, function (e, r) {
    t.equal(e, null, 'should be empty')
    t.equal(r, 0, 'exit code should be 0')
    var log = fs.readFileSync(join(process.cwd(), 'log', 'test1.1.log')).toString()
    t.equal(log, 'Test\nFOO: Bar 1\nArguments: foo1\n', 'log 1 looks good')
    log = fs.readFileSync(join(process.cwd(), 'log', 'test2.1.log')).toString()
    t.equal(log, 'Test\nFOO: BAR 2\nArguments: foo2\n', 'log 2 looks good')
    log = fs.readFileSync(join(process.cwd(), 'log', 'test3.1.log')).toString()
    t.equal(log, 'Test\nFOO: BARTHREE\nArguments: foo3\n', 'log 3 looks good')
    log = fs.readFileSync(join(process.cwd(), 'log', 'test4.1.log')).toString()
    t.equal(log, 'Test\nFOO: global bar\nArguments: foo4\n', 'log 4 looks good')
    log = fs.readFileSync(join(process.cwd(), 'log', 'test5.1.log')).toString()
    var expected = `${process.cwd()}\n`
    t.equal(log, expected, 'log 5 looks good')
    log = fs.readFileSync(join(process.cwd(), 'log', 'sub', 'test6.1.log')).toString()
    expected = `${join(process.cwd(), 'test')}\n`
    t.equal(log, expected, 'log 6 looks good')
  })
})

test('scripts with errors', function (t) {
  t.plan(2)
  run.scripts({ c: join(__dirname, 'fixtures', 'scripts-with-errors.yaml'), v: false }, function (e, r) {
    t.equal(e, null, 'should be empty')
    t.notEqual(r, 0, 'exit code should be non-zero')
  })
})

test('scripts with nested steps', function (t) {
  t.plan(2)
  run.scripts({ c: join(__dirname, 'fixtures', 'scripts-with-nested-steps.yaml'), v: false }, function (e, r) {
    t.equal(e, null, 'should be empty')
    t.equal(r, 0, 'exit code should be zero')
  })
})

test('scripts with nested errors', function (t) {
  t.plan(2)
  run.scripts({ c: join(__dirname, 'fixtures', 'scripts-with-nested-errors.yaml'), v: false }, function (e, r) {
    t.equal(e, null, 'should be empty')
    t.notEqual(r, 0, 'exit code should be non-zero')
  })
})

test('invalid yaml', function (t) {
  t.plan(1)
  run.scripts({ c: 'invalid.yaml' }, function (e) {
    t.notEqual(e, null, 'invalid yaml should return an error')
  })
})

test('name of output file', function (t) {
  t.plan(4)
  var log = run.logFile({ name: 'step name', output_file: 'step.log' }, { count: 1 })
  t.equal(log, 'step.1.log', 'output file for try 1')
  log = run.logFile({ name: 'step name', output_file: 'step.log' }, { count: 2 })
  t.equal(log, 'step.2.log', 'output file for try 2')
  log = run.logFile({ name: 'step name' }, { count: 1 })
  t.equal(log, 'step name.1.log', 'output file defaults to step name')
  log = run.logFile({ name: 'step name' }, { count: 1, output_folder: 'some_folder' })
  t.equal(log, 'some_folder/step name.1.log', 'output file defaults to step name')
})

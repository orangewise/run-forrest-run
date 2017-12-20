var test = require('tape')
var run = require('../lib/run')
var join = require('path').join
var fs = require('fs')

test('scripts without errors', function (t) {
  t.plan(6)
  run.scripts({ c: join(__dirname, 'fixtures', 'scripts.yaml'), v: true }, function (e, r) {
    t.equal(e, null, 'should be empty')
    t.equal(r, 0, 'exit code should be 0')
    var log = fs.readFileSync(join(process.cwd(), 'log', 'test1.log')).toString()
    t.equal(log, 'Test\nFOO: Bar 1\nArguments: foo1\n', 'log 1 looks good')
    log = fs.readFileSync(join(process.cwd(), 'log', 'test2.log')).toString()
    t.equal(log, 'Test\nFOO: BAR 2\nArguments: foo2\n', 'log 2 looks good')
    log = fs.readFileSync(join(process.cwd(), 'log', 'test3.log')).toString()
    t.equal(log, 'Test\nFOO: BARTHREE\nArguments: foo3\n', 'log 3 looks good')
    log = fs.readFileSync(join(process.cwd(), 'log', 'test4.log')).toString()
    t.equal(log, 'Test\nFOO: global bar\nArguments: foo4\n', 'log 4 looks good')
  })
})

test('scripts with errors', function (t) {
  t.plan(2)
  run.scripts({ c: join(__dirname, 'fixtures', 'scripts-with-errors.yaml') }, function (e, r) {
    t.equal(e, null, 'should be empty')
    t.equal(r, 1, 'exit code should be 1')
  })
})

test('scripts with nested steps', function (t) {
  t.plan(2)
  run.scripts({ c: join(__dirname, 'fixtures', 'scripts-with-nested-steps.yaml') }, function (e, r) {
    t.equal(e, null, 'should be empty')
    t.equal(r, 0, 'exit code should be 0')
  })
})

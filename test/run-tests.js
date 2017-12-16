var test = require('tape')
var run = require('../lib/run')
var join = require('path').join

test('scripts without errors', function (t) {
  t.plan(2)
  run.scripts({ c: join(__dirname, 'fixtures', 'scripts.yaml') }, function (e, r) {
    t.equal(e, null, 'should be empty')
    t.equal(r, 0, 'exit code should be 0')
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

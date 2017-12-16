var $RefParser = require('json-schema-ref-parser')

exports.fileContents = function (file, cb) {
  $RefParser.dereference(file, cb)
}

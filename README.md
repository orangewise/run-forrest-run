run-forrest-run
===============

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![JavaScript Style Guide][standardjs-badge]][standardjs-url]


YAML config based script runner.

This runners should be 100% compatible with [scripts](https://www.npmjs.com/package/scriptz).

# Configuration

The configuration exists of flows and steps. We start of by defining a
couple of options and the start flow.

```yaml
options:
  retry_count: number     # (default: 0) Retry count if exit code > 0
  env: Object             # (default: {}) Additional environment variables
start:
  ...
```

The base options that are defined will be used for each step. All the
environment variables from the base options will be used, if it is set.
If it is also defined on the step level, then the object will be merged.

## Flow configuration

```yaml
# Required values
name: string                # Label
flow: string                # Type of flow 'sequential' or 'parallel'
steps: Array<Step>          # Where to write logs / directory should exist
```


## Step configuration

```yaml
# Required values
name: string                # Label used to keep track of script
script: string              # Script location relative to where scriptz is being run
output_file: string         # Where to write logs / directory should exist

continue_on_error: boolean  # (default: false) # Continue even if exit code > 0
arguments: Array<String>    # (default: []) Additional arguments
cwd: string                 # (default: process.cwd()) CWD of the script
env: Object                 # (default: {}) Additional environment variables
retry_count: number         # (default: 0) Retry count if exit code > 0
```


[npm-badge]: https://badge.fury.io/js/run-forrest-run.svg
[npm-url]: https://badge.fury.io/js/run-forrest-run
[travis-badge]: https://travis-ci.org/orangewise/run-forrest-run.svg?branch=master
[travis-url]: https://travis-ci.org/orangewise/run-forrest-run
[coveralls-badge]: https://coveralls.io/repos/github/orangewise/s3-zip/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/orangewise/s3-zip?branch=master
[standardjs-badge]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standardjs-url]: http://standardjs.com/
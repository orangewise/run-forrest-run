run-forrest-run
===============

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![JavaScript Style Guide][standardjs-badge]][standardjs-url]


YAML config based script runner.

[![run-forrest-run](https://img.youtube.com/vi/x2-MCPa_3rU/0.jpg)](https://youtu.be/x2-MCPa_3rU?t=23)

run-forrest-run should be 100% compatible with [scriptz](https://www.npmjs.com/package/scriptz).

# Installation

```SHELL
npm i -g run-forrest-run
```

# Configuration

The configuration exists of flows and steps. We start of by defining a
couple of options and the start flow.

```yaml
options:
  retry_count: number     # (default: 0) Retry count if exit code > 0
  env: Object             # (default: {}) Additional environment variables
  output_folder: string   # (default: '') A folder for your logs
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
steps: Array<Step>          # Step definitions
```


## Step configuration

```yaml
# Required values
name: string                # Label used to keep track of script
script: string              # Script location relative to where scriptz is being run
output_file: string         # Where to write logs, can be prefixed with an output_folder
arguments: Array<String>    # (default: []) Additional arguments
cwd: string                 # (default: process.cwd()) CWD of the script
env: Object                 # (default: {}) Additional environment variables
retry_count: number         # (default: 0) Retry count if exit code > 0
```

## Examples
### Example 1

Run 2 commands in parralel.

```yaml
# example1.yaml
start:
  name: Main
  flow: parallel
  steps:
    - name: File listing
      script: ls
      arguments:
        - -lrt
    - name: Working directory
      script: pwd
```
Run this config:

```
$ run-forrest-run -c example1.yaml -v
```

### Example 2

Run 3 steps in sequence, the steps itself run some commands in parralel.

```yaml
# example2.yaml
start:
  name: Main
  flow: sequential
  steps:
    # the steps details are defined
    # at the bottom of this file
    - $ref: "#/cleanup"
    - $ref: "#/npm-install"
    - $ref: "#/clone"

cleanup:
  name: cleanup log directory
  script: ./cleanup.sh

npm-install:
  name: npm install
  flow: parallel
  steps:
    - name: install s3-zip
      script: npm
      arguments:
        - install
        - s3-zip
    - name: install s3-files
      script: npm
      arguments:
        - install
        - s3-files
    - name: install rotan
      script: npm
      arguments:
        - install
        - rotan

clone:
  name: clone
  flow: parallel
  steps:
    - name: git clone run-forrest-run
      script: git
      arguments:
        - clone
        - git@github.com:orangewise/run-forrest-run.git
      output_file: log/git-clone.log
    - name: git clone s3-zip
      script: git
      arguments:
        - clone
        - git@github.com:orangewise/s3-zip.git
      output_file: log/s3-zip.log
```

Run this config:

```
$ run-forrest-run -c example2.yaml -v
```
[npm-badge]: https://badge.fury.io/js/run-forrest-run.svg
[npm-url]: https://badge.fury.io/js/run-forrest-run
[travis-badge]: https://travis-ci.org/orangewise/run-forrest-run.svg?branch=master
[travis-url]: https://travis-ci.org/orangewise/run-forrest-run
[coveralls-badge]: https://coveralls.io/repos/github/orangewise/run-forrest-run/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/orangewise/run-forrest-run?branch=master
[standardjs-badge]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standardjs-url]: http://standardjs.com/

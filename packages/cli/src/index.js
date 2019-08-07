'use strict'

const { version } = require('../package.json')
const program = require('commander')

program
  .version(version)

program
  .command('set <key> <value>')
  .action((key, value, opt) => {
    console.log('set', key, value)
  })

program
  .command('get <key>')
  .action((key, opt) => {
    console.log('get', key)
  })

program.parse(process.argv)

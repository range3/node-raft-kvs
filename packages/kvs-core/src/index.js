'use strict'

const app = require('./app')

class KvsCore {
  constructor(options) {
    this.app = app(this)
  }

  async listen (...args) {
    let server
    await new Promise((resolve) => {
      server = this.app.listen(...args, resolve)
    })
    return server
  }
}

module.exports = KvsCore

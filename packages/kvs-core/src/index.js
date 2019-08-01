'use strict'

const app = require('./app')
const Raft = require('./model/raft')
const ClientRaft = require('@raft-kvs/client-raft')

class KvsCore {
  constructor (id, servers) {
    const raftClients = servers.reduce((acc, svr) => {
      acc[svr.id] = new ClientRaft(`http://${svr.host}:${svr.port}/v1`)
      return acc
    }, {})

    this.raft = new Raft(id, servers.map(svr => svr.id))
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

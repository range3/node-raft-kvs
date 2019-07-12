'use strict'

const KvsCore = require('@raft-kvs/kvs-core')
const enableDestroy = require('server-destroy')
const once = require('lodash.once')
const config = require('../config')

;(async () => {
  await Promise.all(config.servers.map(async (server) => {
    const kvsCore = new KvsCore(server.id, config.servers.map(svr => svr.id))

    const kvsServer = await kvsCore.listen(server.port, server.host)
    enableDestroy(kvsServer)

    const address = kvsServer.address()
    console.log(`kvsServer ${address.address}:${address.port} started`)

    const destroyOnce = once(() => {
      kvsServer.destroy()
      console.log(`kvsServer ${address.address}:${address.port} destroyed`)
    })

    process.on('SIGINT', destroyOnce)
    process.on('SIGTERM', destroyOnce)
    process.on('SIGUSR2', destroyOnce)

    return destroyOnce
  }))
})()
  .catch(err => console.error(err))

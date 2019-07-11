'use strict'

const KvsCore = require('@raft-kvs/kvs-core')
const enableDestroy = require('server-destroy')
const once = require('lodash.once')

;(async () => {
  const kvsCore = new KvsCore()

  const kvsServer = await kvsCore.listen(8000, '0.0.0.0')
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

})()
  .catch(err => console.error(err))

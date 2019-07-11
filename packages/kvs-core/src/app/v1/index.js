'use strict'

const { Router } = require('express')
const raft = require('./raft')

module.exports = (core) => {
  const router = Router()

  router.use('/raft', raft(core))

  return router
}

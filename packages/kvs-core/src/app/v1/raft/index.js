'use strict'

const { Router } = require('express')

module.exports = (core) => {
  const router = Router()

  router.get('/hello', (req, res, next) => {
    res.json({
      message: 'world',
    })
  })

  router.post('/request-vote', (req, res, next) => {
    console.log(req.body)
    const voteGranted = core.raft.requestVote(
      req.body.term,
      req.body.candidateId,
      req.body.lastLogIndex,
      req.body.lastLogTerm)

    res.json({
      term: core.raft.currentTerm,
      voteGranted,
    })
  })

  router.post('/append-entries', (req, res, next) => {
    core.raft.appendEntries()
    res.boom.notImplemented()
  })

  return router
}

'use strict'

const { Router } = require('express')

module.exports = (core) => {
  const router = Router()

  router.get('/hello', (req, res, next) => {
    res.json({
      message: 'world',
    })
  })

  return router
}

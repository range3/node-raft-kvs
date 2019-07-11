'use strict'

const express = require('express')
const boom = require('express-boom')
const bodyParser = require('body-parser')
const Boom = require('@hapi/boom')
const v1 = require('./v1')

module.exports = (core) => {
  const app = express()
  app.use(boom())
  app.use(bodyParser.json())

  app.use('/v1', v1(core))

  // no route
  app.use((req, res, next) => {
    res.boom.notFound()
  })

  // error handler
  app.use((err, req, res, next) => {
    err = Boom.boomify(err)

    if (err.isServer) {
      console.error(err)
    }

    if (err.code) {
      err.output.payload.code = err.code
    }

    res
      .status(err.output.statusCode)
      .json(err.output.payload)
  })

  return app
}

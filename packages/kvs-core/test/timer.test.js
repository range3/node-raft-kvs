'use strict'

// const { assert } = require('chai')
const Timer = require('../src/model/raft/timer')

describe('Timer', () => {
  it('test', async () => {
    await new Promise((resolve) => {
      const timer = new Timer()
      timer.start(100, () => {
        console.log('callback!!')
        resolve()
      })
    })
  })

  it('should call callback exactly once', async () => {
    let timer = new Timer()
    const start = new Promise((resolve) => {
      timer.start(100, () => {
        console.log('extend!')
        resolve()
      })
    })

    await new Promise(resolve => setTimeout(resolve, 1))

    timer.schedule(500)

    await start
  })
})

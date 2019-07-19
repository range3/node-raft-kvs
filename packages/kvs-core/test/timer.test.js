'use strict'

const { assert } = require('chai')
const Timer = require('../src/model/raft/timer')

describe('Timer', () => {
  it('test', async () => {
    await new Promise((resolve) => {
      const timer = new Timer(100, () => {
        console.log('callback!!')
        resolve()
      })
    })
  })

  it('should call callback exactly once', async () => {
    let timer
    const start = new Promise((resolve) => {
      timer = new Timer(100, () => {
        console.log('restart!')
        resolve()
      })
    })

    await new Promise(resolve => setTimeout(resolve, 1))
    
    timer.restart(500)

    await start
  })
})

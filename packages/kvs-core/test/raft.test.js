'use strict'

const { assert } = require('chai')
const Raft = require('../src/model/raft')

describe('Raft', () => {
  describe('#startElection', () => {
    it('should become a candidate', () => {
      const raft = new Raft('S1', ['S1', 'S2', 'S3', 'S4', 'S5'])

      raft.on('rpc:requestVote', data => console.log(data))

      raft.startElection()

      assert.strictEqual(raft.role, Raft.ROLE.CANDIDATE)
    })
  })
})

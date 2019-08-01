'use strict'

const { assert } = require('chai')
const Raft = require('../src/model/raft')

describe('Raft', () => {
  let raft
  beforeEach(() => {
    raft = new Raft('S1', ['S1', 'S2', 'S3', 'S4', 'S5'])
  })

  describe('#numOfPeers', () => {
    it('should be the num of peers', () => {
      assert.strictEqual(raft.numOfPeers, 5)
    })
  })

  describe('#quorum', () => {
    it('should be the num of majority of peers', () => {
      assert.strictEqual(raft.quorum, 3)
    })
  })

  describe('#countVoteGranted', () => {
    it('should be 0 initially', () => {
      assert.strictEqual(raft.countVoteGranted(), 0)
    })

    it('should be 3 if 3 peers reply the requestVote RPC with vote granted', () => {
      raft.startElection()

      raft.requestVoteReply(1, 'S5', true)
      assert.strictEqual(raft.role, Raft.ROLE.CANDIDATE)
      raft.requestVoteReply(1, 'S3', true)
      assert.strictEqual(raft.role, Raft.ROLE.CANDIDATE)
      raft.requestVoteReply(1, 'S4', false)
      assert.strictEqual(raft.role, Raft.ROLE.CANDIDATE)
      raft.requestVoteReply(1, 'S2', true)
      assert.strictEqual(raft.role, Raft.ROLE.LEADER)

      assert.strictEqual(raft.countVoteGranted(), 3)
    })
  })

  describe('#startElection', () => {
    it('should become a candidate', () => {
      raft.on('rpc:requestVote', data => console.log(data))

      raft.startElection()

      assert.strictEqual(raft.role, Raft.ROLE.CANDIDATE)
    })
  })

  describe('#appendEntries', () => {
    it('should append given entries', () => {
      assert.deepEqual(
        raft.appendEntries(
          0, 'S2', 0, 0, [{ term: 0, command: 'c1' }, { term: 0, command: 'c2' }], 0),
        {
          term: 0,
          success: true,
          matchIndex: 2,
        })

      // should be idempotent
      assert.deepEqual(
        raft.appendEntries(
          0, 'S2', 0, 0, [{ term: 0, command: 'c1' }, { term: 0, command: 'c2' }], 0),
        {
          term: 0,
          success: true,
          matchIndex: 2,
        })

      console.log(require('util').inspect(raft, { depth: null }))
    })
  })
})

'use strict'

const { EventEmitter } = require('events')
const Log = require('./log')

class Raft extends EventEmitter {
  static get ROLE () {
    return {
      FOLLOWER: 1,
      CANDIDATE: 2,
      LEADER: 3,
    }
  }

  constructor (id, peerIds) {
    super()

    // persistent state
    this.currentTerm = 0
    this.votedFor = null
    this.log = new Log()

    // volatile state
    this.commitIndex = 0
    this.lastApplied = 0

    // volatile state on leaders
    this.nextIndex = {}
    this.matchIndex = {}

    // others
    this.id = id.toString()
    this.peers = peerIds
      .map(peerId => peerId.toString())
      .filter(peerId => peerId !== this.id)
      .reduce((acc, peerId) => {
        acc[peerId] = {}
        return acc
      }, {})
    this.clearPeersState()
    this.role = Raft.ROLE.FOLLOWER
  }

  clearPeersState () {
    Object.keys(this.peers).forEach(peerId => {
      this.peers[peerId] = {
        voteGranted: false,
      }
    })
  }

  startElection () {
    this.currentTerm += 1
    this.votedFor = this.id
    this.role = Raft.ROLE.CANDIDATE
    this.clearPeersState()

    // const majorityThreashold = Math.ceil((serverNum + 1) / 2)

    Object.keys(this.peers).forEach(peerId => {
      this.emit('rpc:requestVote', {
        to: peerId,
        term: this.currentTerm,
        candidateId: this.id,
        lastLogIndex: this.log.lastIndex,
        lastLogTerm: this.log.lastTerm,
      })
    })
  }

  requestVote (term, candidateId, lastLogIndex, lastLogTerm) {
    if (term < this.currentTerm) {
      return false
    } else if (term > this.currentTerm) {
      this.currentTerm = term
      this.votedFor = null
      this.role = Raft.ROLE.FOLLOWER
      this.clearPeersState()
    }

    if (this.votedFor === null || this.votedFor === candidateId) {
      if (this.log.lessEqualThan(lastLogIndex, lastLogTerm)) {
        this.votedFor = candidateId
        return true
      } else {
        return false
      }
    }
  }

  requestVoteReply (term, voteGranted) {
    if (term > this.currentTerm) {
      this.role = Raft.ROLE.FOLLOWER
      this.currentTerm = term
      this.votedFor = null
    }

    // this.peer
  }

  appendEntries () {}
}

module.exports = Raft

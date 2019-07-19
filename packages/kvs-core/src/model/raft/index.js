'use strict'

const { EventEmitter } = require('events')
const Log = require('./log')
const util = require('./util')

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

    // others
    this.id = id.toString()
    this.peerIds = peerIds
      .map(peerId => peerId.toString())
      .filter(peerId => peerId !== this.id)
    this.role = Raft.ROLE.FOLLOWER

    // volatile state on leaders
    this.voteGranted = util.makeMap(this.peerIds, false)
    this.matchIndex = util.makeMap(this.peerIds, 0)
    this.nextIndex = util.makeMap(this.peerIds, 1)

    // information for clients
    this.leaderId = null
  }

  get numOfPeers () {
    return this.peerIds.length + 1
  }

  get majorityThreshold () {
    return Math.floor(this.numOfPeers / 2) + 1
  }

  countVoteGranted () {
    return Object.keys(this.voteGranted)
      .reduce((acc, peerId) => (this.voteGranted[peerId] ? acc + 1 : acc), 0)
  }

  stepDown (term) {
    this.currentTerm = term
    this.role = Raft.ROLE.FOLLOWER
    this.votedFor = null

    // TODO: electionTimeout timer start
  }

  startElection () {
    this.currentTerm += 1
    this.votedFor = this.id
    this.role = Raft.ROLE.CANDIDATE
    this.voteGranted = util.makeMap(this.peerIds, false)
    this.matchIndex = util.makeMap(this.peerIds, 0)
    this.nextIndex = util.makeMap(this.peerIds, 1)

    this.peerIds.forEach(peerId => {
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
      return {
        term: this.currentTerm,
        voteGranted: false,
      }
    } else if (term > this.currentTerm) {
      this.stepDown(term)
    }

    if (this.votedFor === null || this.votedFor === candidateId) {
      if (this.log.lessEqualThan(lastLogIndex, lastLogTerm)) {
        this.votedFor = candidateId
        this.emit('timer:extendElectionTimeout', 100) // FIXME: generate random
        return {
          term: this.currentTerm,
          voteGranted: true,
        }
      } else {
        return {
          term: this.currentTerm,
          voteGranted: false,
        }
      }
    }
  }

  requestVoteReply (term, voterId, voteGranted) {
    if (term > this.currentTerm) {
      this.stepDown(term)
      return
    }

    if (this.role === Raft.ROLE.CANDIDATE &&
      this.currentTerm == term) {
      this.voteGranted[voterId] = voteGranted

      if (this.countVoteGranted() >= this.majorityThreshold) {
        this.role = Raft.ROLE.LEADER
      }
    }
  }

  appendEntries (term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit) {
    let success = false
    let matchIndex = 0

    if (this.currentTerm < term) {
      this.stepDown(term)
    }
    
    if(this.currentTerm === term) {
      this.leaderId = leaderId
      this.role = Raft.ROLE.FOLLOWER
      // TODO: election timer extends

      if (this.log.contain(prevLogIndex, prevLogTerm)) {

        let index = prevLogIndex
        for (let entry of entries) {
          index += 1
          if(!this.log.contain(index, entri.term)) {
            this.log.trim(index)
            this.log.push(entry) // 1つずつ渡すのではなく、まとめて渡したほうが性能よさそう
          }
        }

        matchIndex = index
        success = true
        this.commitIndex = Math.max(this.commitIndex, leaderCommit)
      }
    }

    return {
      term: this.currentTerm,
      success,
      matchIndex,
    }
  }
}

module.exports = Raft

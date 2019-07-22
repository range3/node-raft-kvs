'use strict'

const { EventEmitter } = require('events')
const Log = require('./log')
const util = require('./util')

const ELECTION_TIMEOUT_MIN_MSEC = 150

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

  generateElectionTimeout () {
    return (Math.random() + 1) * ELECTION_TIMEOUT_MIN_MSEC
  }

  stepDown (term) {
    this.currentTerm = term
    this.role = Raft.ROLE.FOLLOWER
    this.votedFor = null

    this.emit('timer:extendElectionTimeout', this.generateElectionTimeout())
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
        this.emit('timer:extendElectionTimeout', this.generateElectionTimeout())
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
      this.currentTerm === term) {
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

    if (this.currentTerm === term) {
      this.leaderId = leaderId
      this.role = Raft.ROLE.FOLLOWER
      this.emit('timer:extendElectionTimeout', this.generateElectionTimeout())

      if (this.log.contain(prevLogIndex, prevLogTerm)) {
        let index = prevLogIndex + 1
        for (let entry of entries) {
          if (!this.log.contain(index, entry.term)) {
            this.log.trim(index)
            break
          }
          index += 1
        }
        const skip = index - (prevLogIndex + 1)
        this.log.concat(entries.slice(skip))

        matchIndex = this.log.lastIndex
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

  appendEntriesReply (term, followerId, success, matchIndex) {
    if (this.currentTerm < term) {
      this.stepDown(term)
    }

    if (this.role === Raft.ROLE.LEADER &&
        this.currentTerm === term) {
      if (success) {
        this.matchIndex[followerId] = Math.max(
          this.matchIndex[followerId], matchIndex)
        this.nextIndex[followerId] = matchIndex + 1
      } else {
        this.nextIndex[followerId] = Math.max(1, this.nextIndex[followerId] - 1)
      }
    }
  }
}

module.exports = Raft

'use strict'

const Client = require('./client')

class ClientRaft {
  constructor (baseUrl) {
    this.client = new Client(baseUrl)
  }

  async requestVote (term, candidateId, lastLogIndex, lastLogTerm) {
    try {
      return await this.client.requestVote(
        term, candidateId, lastLogIndex, lastLogTerm)
    } catch (err) {
      return {
        term: 0,
        voteGranted: false,
      }
    }
  }

  appendEntries () {}
}

module.exports = ClientRaft

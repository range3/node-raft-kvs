'use strict'

const request = require('superagent')
const urljoin = require('url-join')

class Client {
  constructor (baseUrl, options = {}) {
    this.baseUrl = new URL(baseUrl)

    this.requestVoteUrl = new URL(urljoin(this.baseUrl.href, '/raft/request-vote'))
    this.appendEntriesUrl = new URL(urljoin(this.baseUrl.href, '/raft/append-entries'))
  }

  requestVote (term, candidateId, lastLogIndex, lastLogTerm) {
    return request
      .post(this.requestVoteUrl)
      .send({
        term,
        candidateId,
        lastLogIndex,
        lastLogTerm,
      })
      .buffer(true)
  }

  appendEntries () {
    return request
      .post(this.appendEntriesUrl)
      .buffer(true)
  }
}

module.exports = Client

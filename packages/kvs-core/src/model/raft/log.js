'use strict'

class Log {
  constructor () {
    this.payload = [{ term: 0, command: null }] // [sentinel, {term: number, command: object},...]
  }

  get lastIndex () {
    return this.payload.length - 1
  }

  get lastTerm () {
    return this.payload[this.lastIndex].term
  }

  lessEqualThan (lastIndex, lastTerm) {
    if (this.lastTerm < lastTerm) {
      return true
    } else if (this.lastTerm === lastTerm && this.lastIndex <= lastIndex) {
      return true
    } else {
      return false
    }
  }

  get length () {
    return this.payload.length
  }

  entry (index) {
    return this.payload[index]
  }

  contain (index, term) {
    return index < this.payload.length && this.payload[index].term === term
  }

  trim (start) {
    if (start >= this.log.payload.length) {
      return
    }
    this.payload = this.payload.slice(0, start)
  }

  push (entry) {
    this.payload.push(entry)
  }
}

module.exports = Log

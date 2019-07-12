'use strict'

class Log {
  get lastIndex () {
    return 0
  }

  get lastTerm () {
    return 0
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
}

module.exports = Log

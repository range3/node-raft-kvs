'use strict'

// (Node.jsはシングルスレッドなので関係ないが)
// multi threadなIO loopにおいて、deadline extendableなtimerが欲しい
// timerをキャンセルしようとした時、他のスレッドによってtimer handlerが既に起きている可能性がある
// なので、タイマーのキャンセル処理と、deadlineのreschedule処理は、lazyに、
// 次回タイマーハンドラが起きたときに処理する

const STATE = {
  STOPPED: 2,
  SCHEDULED: 4,
  STOPPING: 5,
}

class Timer {
  static get STATE () {
    return STATE
  }

  constructor (cb) {
    this.state = Timer.STATE.STOPPED
    this.cb = cb
  }

  start (ms, cb) {
    this.cb = cb
    this.schedule(ms)
  }

  schedule (ms) {
    switch (this.state) {
      case Timer.STATE.STOPPED:
        this.state = Timer.STATE.SCHEDULED
        this.due = Date.now() + ms
        setTimeout(() => {
          this.handleTimeout()
        }, ms)
        break
      case Timer.STATE.SCHEDULED:
      case Timer.STATE.STOPPING:
        this.state = Timer.STATE.SCHEDULED
        this.due = Date.now() + ms
        break
    }
  }

  stop () {
    switch (this.state) {
      case Timer.STATE.SCHEDULED:
        this.state = Timer.STATE.STOPPING
        break
    }
  }

  handleTimeout () {
    // timer lock start
    switch (this.state) {
      case Timer.STATE.SCHEDULED:
        const now = Date.now()
        if (this.due > now) {
          setTimeout(() => {
            this.handleTimeout()
          }, this.due - now)
        } else {
          this.state = Timer.STATE.STOPPED
          this.cb()
        }
        break
      case Timer.STATE.STOPPING:
        this.state = Timer.STATE.STOPPED
        break
      default:
        throw new Error(`invalid timer state: ${this.state}`)
    }
  }
}

module.exports = Timer

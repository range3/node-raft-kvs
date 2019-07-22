'use strict'

// (Node.jsはシングルスレッドなので関係ないが)
// multi threadなIO loopにおいて、deadline extendableなtimerが欲しい
// timerをキャンセルしようとした時、他のスレッドによってtimer handlerが既に起きている可能性がある
// なので、タイマーのキャンセル処理と、deadlineのreschedule処理は、lazyに、
// 次回タイマーハンドラが起きたときに処理する

const STATE = {
  STOPPED: 2,
  STARTED: 3,
  RESCHEDULED: 4,
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
    this.restart(ms)
  }

  restart (ms) {
    switch (this.state) {
      case Timer.STATE.STOPPED:
        this.state = Timer.STATE.STARTED
        setTimeout(() => {
          this.handleTimeout()
        }, ms)
        break
      case Timer.STATE.STARTED:
      case Timer.STATE.RESCHEDULED:
      case Timer.STATE.STOPPING:
        this.state = Timer.STATE.RESCHEDULED
        this.due = Date.now() + ms
        break
    }
  }

  extend (ms) {
    this.restart(ms)
  }

  stop () {
    switch (this.state) {
      case Timer.STATE.STARTED:
      case Timer.STATE.RESCHEDULED:
        this.state = Timer.STATE.STOPPING
        break
    }
  }

  handleTimeout () {
    // timer lock start
    switch (this.state) {
      case Timer.STATE.STARTED:
        this.state = Timer.STATE.STOPPED
        // timer lock end
        this.cb()
        break
      case Timer.STATE.RESCHEDULED:
        const now = Date.now()
        if (this.due > now) {
          this.state = Timer.STATE.STARTED
          const ms = this.due - now
          // timer lock end
          setTimeout(() => {
            this.handleTimeout()
          }, ms)
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

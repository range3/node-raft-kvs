'use strict'

// (Node.jsはシングルスレッドなので関係ないが)
// multi threadなIO loopにおいて、deadline extendableなtimerが欲しい
// timerをキャンセルしようとした時、他のスレッドによってtimer handlerが既に起きている可能性がある
// なので、キャンセルするのは諦めて、timer handlerは必ず1度呼び出されるのを前提とし、
// timer handlerが呼ばれたら、deadlineの延期をチェックし、されていればタイマーを再セットする。
// 延期されていなければ、callbackを呼び、終了する

class Timer {
  constructor () {
    this.extended = false
    this.cb = null
  }

  start (ms, cb) {
    if (this.cb) {
      throw new Error('Timer is already started')
    }
    this.due = Date.now() + ms
    this.cb = cb
    this.extended = false
    setTimeout(() => {
      this.handleTimeout()
    }, ms)
  }

  extend (ms) {
    // timer lock start
    this.due = Date.now() + ms
    this.extended = true
    // timer lock end
  }

  handleTimeout () {
    // timer lock start
    const now = Date.now()
    if (this.extended && this.due > now) {
      this.extended = false
      setTimeout(() => {
        this.handleTimeout()
      }, this.due - now)
      // timer lock end
    } else {
      // timer lock end
      this.cb()
    }
  }
}

module.exports = Timer

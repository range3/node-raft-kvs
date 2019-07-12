'use strict'

class KeyValueStore {
  constructor () {
    this.map = new Map()
  }

  set (key, value) {
    this.map.set(key, value)
  }

  get (key) {
    this.map.get(key)
  }
}

module.exports = KeyValueStore

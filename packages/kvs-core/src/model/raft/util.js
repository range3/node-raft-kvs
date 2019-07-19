'use strict'

exports.makeMap = function (keys, value) {
  return keys.reduce((acc, key) => {
    acc[key] = value
    return acc
  }, {})
}

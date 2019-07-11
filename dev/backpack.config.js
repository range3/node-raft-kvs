const baseConfig = require('@raft-kvs/backpack-config')

module.exports = {
  webpack: (config, options, webpack) => {
    config = baseConfig.webpack(config, options, webpack)
    return config
  },
}

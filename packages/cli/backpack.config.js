const baseConfig = require('@raft-kvs/backpack-config')

module.exports = {
  webpack: (config, options, webpack) => {
    config = baseConfig.webpack(config, options, webpack)
    config.plugins.push(
      new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    )
    return config
  },
}

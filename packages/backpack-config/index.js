const path = require('path')
const nodeExternals = require('webpack-node-externals')
const findWorkspaceRoot = require('find-yarn-workspace-root')

module.exports = {
  webpack: (config, options, webpack) => {
    config.externals = [
      config.externals,
      nodeExternals({
        modulesDir: path.resolve(findWorkspaceRoot(__dirname), 'node_modules'),
        whitelist: [
          /@raft-kvs/,
          /@range3/,
        ],
      }),
    ]
    return config
  },
}

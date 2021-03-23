module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /worker\.js$/,
          use: {
            loader: 'worker-loader',
            options: {
              // inline: 'no-fallback',
              worker: {
                type: 'SharedWorker',
                options: {
                  type: 'classic',
                  credentials: 'omit',
                  name: `s-worker.${require('crypto')
                    .randomBytes(20)
                    .toString('hex')}.js`
                }
              }
            }
          }
        }
      ]
    }
  }
}

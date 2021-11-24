class DeleteSourceMapWebpackPlugin {
  constructor () {
  }

  apply (compiler) {
    let countMatchAssets = 0;
    compiler.plugin('after-compile', (compilation, cb) => {
        Object.keys(compilation.assets).filter((key) => {
          return /\.js$/.test(key);
        })
        .forEach((key) => {
          countMatchAssets += 1;
          let asset = compilation.assets[key];
          const source = asset.source()
          const sourceStr = source.toString()
          const updatedString = sourceStr.replace(/# sourceMappingURL=(.*\.map)/g, '# $1')
          const updatedSource = updatedString.toString('binary')
          compilation.assets[key] = Object.assign(asset, {
            source: function () { return updatedSource }
          });
        });
        cb()
    })
  
    compiler.plugin('done', (stats) => {
      const fs = require('fs')
      let countMatchMapAssets = 0
      Object.keys(stats.compilation.assets)
      .filter(name => /\.js\.map$/.test(name))
      .forEach((name) => {
        countMatchMapAssets += 1
        const { existsAt } = stats.compilation.assets[name]
        if (existsAt) {
          fs.unlinkSync(existsAt)
        }
      })
      console.log(`⭐⭐⭐removed source map url: ${countMatchAssets} asset(s) processed`);
      console.log(`⭐⭐⭐deleted map file: ${countMatchMapAssets} asset(s) processed`);
    })
  }
}

module.exports = DeleteSourceMapWebpackPlugin

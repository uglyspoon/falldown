var fs = require('fs')
var path = require('path')
var config = require('../config')

var cssDir = path.join(config.build.assetsRoot, '/static/css')

function replaceErrorImagePath() {
  fs.readdir(cssDir,  (err, files) => {
    if (err) return console.error(err)
    files.forEach((file) => {
      var filepath = path.join(cssDir, file)
      fs.readFile(filepath, 'utf8', (err, res) => {
        if(err) return console.error(err)
        var replaceText = res.replace(/static\/img\//g, '../img\/');
        var replaceFont = replaceText.replace(/static\/fonts\//g, '../fonts\/')
        fs.writeFile(filepath, replaceFont, 'utf8', (err,res) => {
          if(err) return console.error(err)
          console.log(`${filepath} replaced`)
        })
      })
    })
  })
}

module.exports = replaceErrorImagePath

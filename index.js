import fs from 'fs'
import path from 'path'
// server from './jump-server/index.js'

const _path = process.cwd()
const files = fs.readdirSync('./plugins/verifycation-plugin/apps').filter(file => file.endsWith('.js'))

async function configfile() {
  const configPath = process.cwd() + '/plugins/verifycation-plugin/config/config/config.json'
  const configExampleFile = process.cwd() + '/plugins/verifycation-plugin/config/defset/config.json'
  fs.access(configPath, fs.constants.F_OK, (err) => {
      if (err) {
          fs.copyFile(configExampleFile, configPath, (err) => {
              if (err) throw err
          })
      }
  })
}
await configfile()
const configdir = `${_path}/plugins/verifycation-plugin/config/config`


  if (!fs.existsSync(configdir)) {
    await mkdirs(configdir)
  }

async function mkdirs(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirs(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}


let ret = []
files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
console.log('verifycation-plugin 初始化')

// server()

export { apps }

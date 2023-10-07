import fs from "fs"
import Yaml from "yaml"
import path from "path"

const _path = "./plugins/verifycation-plugin/config"
const configPath = _path + "/config/config.yaml"

if (!fs.existsSync(configPath)) {

  const configDir = path.dirname(configPath)

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  fs.copyFileSync(_path + "/defset/config.yaml", configPath)
}

const config = Yaml.parse(fs.readFileSync(_path + "/config/config.yaml", "utf8"))
const Config = {
  geeAddress: config.geeAddress,
  jumpAddress: config.jumpAddress,
  checkAddress: config.checkAddress
}
// 初始化加载配置
loadConfig()
let reloadconfig = false
fs.watch(_path + "/config/config.yaml", () => {
  // 文件发生变化时,重新加载
  reloadconfig = true
  setTimeout(() => {
    loadConfig()
    reloadconfig = false
  }, 300)
})
function loadConfig() {
  const config = Yaml.parse(fs.readFileSync(_path + "/config/config.yaml", "utf8"))

  Config.geeAddress = config.geeAddress
  Config.jumpAddress = config.jumpAddress
  Config.checkAddress = config.checkAddress
}

export { Config }
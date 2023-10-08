import fs from 'fs'

const _path = process.cwd()
const plugin_path = _path + '/plugins/verifycation-plugin'

const mysinfo_path = _path + '/plugins/genshin/model/mys/mysInfo.js'
const apiTool_path = _path + '/plugins/genshin/model/mys/apiTool.js'


const backup_mysinfo_path = _path + '/plugins/verifycation-plugin/backup/mysinfo.js'
const backup_apiTool_path = _path + '/plugins/verifycation-plugin/backup/apiTool.js'

export class pass extends plugin {
    constructor() {
        super({
            name: "米游社替换",
            event: "message",
            priority: 100,
            rule: [
                {
                    reg: "^#(米游社|bbs)(替换|备份)$",
                    fnc: "replace",
                    permission: "master"
                },
                {
                    reg: "^#(米游社|bbs)(还原|恢复)备份?$",
                    fnc: "restore",
                    permission: "master"
                }
            ]
        })
    }

    async replace() {
        /** 检查是否已存在备份 */
        if (fs.existsSync(backup_mysinfo_path && backup_apiTool_path)) {
            return await this.reply('已存在备份，请使用【#米游社还原】后再进行替换', true)
        } else {
            try {
                /** 备份 */
                fs.renameSync(mysinfo_path, backup_mysinfo_path)
                fs.renameSync(apiTool_path, backup_apiTool_path)
                /** 重写 */
                fs.copyFileSync(plugin_path + '/mys/res/mysInfo.js', mysinfo_path)
                fs.copyFileSync(plugin_path + '/mys/res/apiTool.js', mysinfo_path)
                return await this.reply("替换完成，重启生效！", true)
            } catch (error) {
                return await this.reply(`替换失败:${error.message}`, true)
            }
        }
    }

    async restore() {
        /** 检查是否已存在备份 */
        if (fs.existsSync(backup_mysinfo_path && backup_apiTool_path)) {
            try {
                //mysinfo.js
                fs.copyFileSync(backup_mysinfo_path, mysinfo_path)
                fs.unlinkSync(backup_mysinfo_path)

                //apiTool.js
                fs.copyFileSync(backup_apiTool_path, apiTool_path)
                fs.unlinkSync(backup_apiTool_path)

                return await this.reply('还原成功，重启生效!', true)
            } catch (error) {
                return await this.reply(`还原失败:${error.message}`, true)
            }
        }
        return await this.reply('你还没有替换过，发送【#米游社替换】后再进行还原', true)
    }
}
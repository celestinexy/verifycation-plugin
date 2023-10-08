import { Config } from './model/config.js'
// 支持锅巴
export function supportGuoba() {
    return {
        // 插件信息，将会显示在前端页面
        // 如果你的插件没有在插件库里，那么需要填上补充信息
        // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
        pluginInfo: {
            name: 'verifycation-plugin',
            title: 'verifycation-plugin',
            author: '@ikenxuan',
            authorLink: 'https://github.com/ikenxuan',
            link: 'https://github.com/ikenxuan/verifycation-plugin',
            isV3: true,
            isV2: false,
            description: '提供了视频解析功能，额外的语音盒资源。自用练手项目',
            // 显示图标，此为个性化配置
            // 图标可在 https://icon-sets.iconify.design 这里进行搜索
            icon: 'svg-spinners:blocks-shuffle-3',
            // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
            iconColor: '#00c3ff'
        },
        // 配置项信息
        configInfo: {
            // 配置项 schemas
            schemas: [
                {
                    field: 'geeAddress',
                    label: '验证码API地址',
                    bottomHelpMessage: '如:http://api.example.com/geetest?gt={0}&challenge={1}',
                    component: 'Input'
                },
                {
                    field: 'checkAddress',
                    label: '验证码API检查地址',
                    bottomHelpMessage: '如:http://api.example.com/manual/',
                    component: 'Input'
                },
                {
                    field: 'jumpAddress',
                    label: '重定向服务地址',
                    bottomHelpMessage: '如:http://api.example.com/',
                    component: 'Input'
                },

            ],
            // 获取配置数据方法（用于前端填充显示数据）
            getConfigData() {
                return Config
            },
            // 设置配置的方法（前端点确定后调用的方法）
            setConfigData(data, { Result }) {
                for (let [keyPath, value] of Object.entries(data)) {
                    if (Config[keyPath] != value) { Config[keyPath] = value }
                }
                return Result.ok({}, '保存成功~')
            }
        }
    }
}

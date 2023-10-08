# verifycation-plugin（bbs手动验证码插件）
* **此插件基于Miao-Yunzai开发，Yunzai-Bot和TRSS-Yunzai是否可用请自行测试**
* **本插件是纯手动验证，自动验证暂时无法实现**
* **开发中，BUG多**
## 安装

```
# Github
git clone https://github.com/ikenxuan/verifycation-plugin ./plugins/verifycation-plugin
```

```
# Gitee
git clone 未上传
```
## 配置
**不配置验证接口地址时次插件将不可用！**

可使用 [锅巴插件](https://github.com/guoba-yunzai/guoba-plugin.git) 进行配置
```
# 配置文件路径
/verifycation-plugin/config/config/config.json
```
```
{
  // 验证码API地址(如:http://api.example.com/geetest?gt={0}&challenge={1})
  "geeAddress": "", 

  // 验证码API短链地址(如:http://api.example.com/)
  "checkAddress": "",

  // 验证码API检查(如:http://api.example.com/manual/)
  "jumpAddress": ""
}
```
## 使用
### #米游社替换 / #bbs替换
* 将会替换 `genshen` 文件夹内关键文件， 实现 `Miao-Yunzai` 本体遇到验证码将由本插件接管处理

### #米游社恢复 / #bbs恢复
* 从插件备份文件夹中恢复 `genshen` 原本被替换的文件

## TODO

**！目前插件内 `jump-server` 启动方法已注释，重定向服需额外单独部署**
---
[x] 适配 `miao-plugin` 会弹验证码的命令

[ ] 插件本体自带短链转发 (应该会咕咕咕，因为 [jump-server](https://github.com/ikenxuan/jump-server) 可单独部署，没必要放到插件里面启动)

[ ] 复刻 `Yunzai-Bot` #签到 功能

[ ] 适配更多接码接口(目前适配了小灰灰)
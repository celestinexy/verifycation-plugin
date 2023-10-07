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

请参考config.yaml文件注释配置对应API接口
```
# 配置文件路径
/verifycation-plugin/config/config/config.yaml
```
## 使用
### #米游社替换
* 将会替换 `genshen` 文件夹内关键文件， 实现 `Miao-Yunzai` 本体遇到验证码将由本插件接管处理

### #米游社恢复
* 从插件备份文件夹中恢复 `genshen` 原本被替换的文件

## TODO
[x] 适配 `miao-plugin` 会弹验证码的命令

[ ] 自带重定向服务器(短链转发)

[ ] 复刻 `Yunzai-Bot` #签到 功能

[ ] 适配更多接码接口
# bbs手动验证地址重定向服务

## 安装（二选其一）

```
# 独立服务
git clone --depth=1 https://github.com/ikenxuan/jump-server.git

# Miao-Yunzai插件
git clone --depth=1 https://github.com/ikenxuan/jump-server.git ./plugins/jump-server/
```
```
# 安装依赖 npm 、pnpm 或 yarn
npm install
```

## 使用
当作Miao-Yunzai插件的不用看，插件会跟随喵崽启动而启动
```
# 后台驻留
npm run start
```
```
# 后台注销
npm run stop
```

```
# 输出日志
npm run log
```
默认监听 `0.0.0.0`:3001

服务器开放端口即可对外访问

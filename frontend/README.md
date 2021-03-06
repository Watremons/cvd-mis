# CVDMIS系统前端项目

## 0.项目背景

## 1.如何启动

本项目使用[Create React App](https://github.com/facebook/create-react-app).

### 可用命令

在项目目录下运行

### `yarn start`

将在[http://localhost:3000](http://localhost:3000)下以开发模式运行项目

可在浏览器查看页面并查看报错

项目修改时页面将自动刷新

### `yarn test`

在测试模式下运行项目

在[running tests](https://facebook.github.io/create-react-app/docs/running-tests)获取更多信息

### `yarn build`

在build文件夹下构建生产环境项目文件，并针对生产环境性能进行优化

build结果为经过最小化和hash之后的可部署文件

在[deployment](https://facebook.github.io/create-react-app/docs/deployment)获取更多信息

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## 2.版本要求

node: 16.13.0

npm: 8.1.0

## 3.插件配置

本项目使用eslint进行包配置，使用prettier进行代码自动规范
使用的规范为：

```
'plugin:react/recommended'
'plugin:@typescript-eslint/recommended'
'plugin:prettier/recommended'
```

前端打包通过craco进行配置，包括：

* 配置开发环境下的本地代理以解决跨域问题
* 使用webpack-bundle-analyzer配置打包文件分析，可视化展示前端打包css和js文件，便于后续分割打包文件体积
* 使用plugin-proposal-decorators插件以支持装饰器语法
* 使用babel-plugin-import进行依赖包css按需引入，减小打包文件体积

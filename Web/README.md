# 前端网页源代码

## 说明
前端项目采用了React+Dva+Antd的模式进行开发

## 本地调试

* 运行```yarn install```以安装必要的依赖
* 在```public/config.json```中修改host为待调试的后端服务接口
* 运行```npm run start```进行本地调试
* 运行```npm run build```编译网页部署包
* 运行```python merge.py```将编译得到的index.js、index.css合并入index.html中(非必选操作)
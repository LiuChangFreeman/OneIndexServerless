# 后端服务源代码

## 说明
后端项目是一个简单的Python Flask应用，部署到云上时所使用的依赖由服务商提供

## 本地调试

* 您需要首先运行```pip install -r requirements.txt```以安装必要的依赖
* 在main.py中填写必要的配置信息，其中oss_end_point需要去除```-internal```以便进行公网访问，如：
    ```
    oss_end_point= 'http://oss-cn-shanghai-internal.aliyuncs.com'#访问对象存储的endpoint
    ```
    应修改为:
    ```
    oss_end_point= 'http://oss-cn-shanghai.aliyuncs.com'#访问对象存储的endpoint
    ```
* 将url_host改为您的本地调试端口
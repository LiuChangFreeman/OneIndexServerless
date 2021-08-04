# 部署包
```Front```和```Back```文件夹分别是已编译的前端网页和后端源代码

其中```Back/main.py```中您需要修改这几行配置信息
```
password="123456"#后台管理的密码
url_host= "".strip("/")
#http触发器的接口url


access_key=''#云账号的AccessKey
access_key_secret=''#云账号AccessKey的密码
oss_end_point= 'http://oss-cn-shanghai-internal.aliyuncs.com'#访问对象存储的endpoint
oss_bucket_name='sample bucket name'#可以使用的对象存储桶名称
```
```Front/config.json```中需要将```host```字段修改为```main.py```中相同的http触发器的url

Front文件夹下仅含有两个部署文件，您可以使用任意一种方法将前端网页部署到网络上，如iis、nginx、httpd。甚至您可以直接用GitHub Pages等静态网页托管服务。

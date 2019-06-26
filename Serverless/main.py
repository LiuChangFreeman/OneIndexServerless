# -*- coding: utf-8 -*-
#scf所配置的http触发器路径
url_host= ""
#在bucket中可以使用的文件夹名，不存在则自动建立
path_oss_store= "onedrive"
#在oss中保存的配置文件名称
filename_token= "token.json"
#访问oss服务的凭据、密码、bucket名
access_key=''
access_key_secret=''
oss_bucket_name=''
#访问oss服务所需要指定的endpoint域名，内网，外网
oss_end_point_internal='http://oss-cn-{}-internal.aliyuncs.com'.format('region of your oss')
oss_end_point_public='http://oss-cn-{}.aliyuncs.com'.format('region of your oss')

#在 https://apps.dev.microsoft.com/?#/appList 所注册的应用程序信息
client_id = ''
client_secret = ''
redirect_uri = '{}login/authorized'.format(url_host)
from lib import app,init

def initializer(context):
    init()

def handler(environ, start_response):
    return app(environ, start_response)
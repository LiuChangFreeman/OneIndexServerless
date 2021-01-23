# -*- coding: utf-8 -*-
from __future__ import print_function
import os
import oss2
import requests
import urllib
import json
import base64
import time
from flask import Flask,request,redirect

#以下按需更改
password="123456"#后台管理的密码
url_host= ""
#http触发器的接口url


access_key=''#云账号的AccessKey
access_key_secret=''#云账号AccessKey的密码
oss_end_point= 'http://oss-cn-shanghai-internal.aliyuncs.com'#访问对象存储的endpoint
oss_bucket_name=''#可以使用的对象存储桶名称

#以下可以不修改
path_oss_store= "oneindex-serverless"#在存储桶中创建的文件夹名称
filename_token= "token.json"#保存凭据的文件名
items_per_page=50#每次获取的项目数量

#以下请勿更改
app = Flask(__name__)
app.secret_key = 'oneindex-serverless'

client_id = '0375f766-e528-4748-91e2-7d8fcb702889'
client_secret = 'vXOJL93{#?xnotilNIU895:'
redirect_uri_register = 'https://oneindex-serverless.github.io/redirect'
redirect_uri_final = '{}/login/authorized'.format(url_host.strip("/"))

auth = oss2.Auth(access_key,access_key_secret)
bucket = oss2.Bucket(auth, oss_end_point, oss_bucket_name)
base_url='https://graph.microsoft.com/v1.0/'
scopes= "offline_access files.read.all"
select="id,name,size,folder,image,video,lastModifiedDateTime"

token=None
oss_available=False

def initializer(context):
    init()

def handler(environ, start_response):
    return app(environ, start_response)

@app.route('/')
def home():
    if token==None or "account" not in token:
        data = {
            "success":False,
            "oss_available":oss_available
        }
    else:
        data = {
            "success": True,
            "account":token["account"],
            "oss_available":oss_available,
        }
    return json.dumps(data)

@app.route('/verify')
def verify():
    code=request.args.get("code")
    code=base64.b64decode(code)
    if code==password:
        data={
            "success":True
        }
    else:
        data={
            "success":False
        }
    return json.dumps(data)

@app.route('/login')
def login():
    code=request.args.get("code")
    code=base64.b64decode(code)
    final=request.args.get("final")
    if code==password:
        url_login="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={}&scope={}&response_type=code&redirect_uri={}&state={}".format(client_id, urllib.quote(scopes), redirect_uri_register, redirect_uri_final+"*"+final)
        return redirect(url_login)

@app.route('/login/authorized')
def authorized():
    global token
    try:
        code=request.args.get("code")
        final = request.args.get("final")
        url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        form = "client_id={}&redirect_uri={}&client_secret={}&code={}&grant_type=authorization_code".format(client_id,redirect_uri_register,client_secret,code)
        token = requests.post(url, headers=headers, data=form).json()
        token["time"] = time.time()
        path = "me/drive"
        url = base_url + path
        access_token = token["access_token"]
        headers = {
            "Authorization": "bearer {}".format(access_token),
            "Content-Type": "application/json"
        }
        me = requests.get(url, headers=headers).json()
        try:
            token["account"]=me["owner"]["user"]["email"]
        except:
            token["account"] = me["owner"]["user"]["displayName"]
        token["drive"] = me["id"]
        json_token = json.dumps(token, ensure_ascii=False, indent=4)
        path_token = os.path.join(path_oss_store, filename_token)
        bucket.put_object(path_token, json_token)
        bucket.put_object_acl(path_token,oss2.OBJECT_ACL_PRIVATE)
        return redirect(final)
    except Exception as e:
        result={"error":e.message,"token":token,"code":code,"final":final}
        return json.dumps(result)

@app.route('/list', methods = ["GET","POST"])
def list():
    try:
        drive = token["drive"]
        access_token = token["access_token"]
        headers={
            "Authorization":"bearer {}".format(access_token),
            "Content-Type":"application/json"
        }
        if request.method=="POST":
            data=request.get_data(as_text=True)
            data = json.loads(data)
            url=data["next"]
        else:
            path=request.values.get("path")
            if path:
                path = "drives/{}/root:/{}:/children".format(drive, path)
            else:
                path = "me/drive/root/children"
            url = base_url + path
            url = "{}?$top={}&$select={}".format(url, items_per_page, select)
        data = requests.get(url, headers=headers).json()
        response={}
        items=[]
        list=data["value"]
        for item in list:
            result={}
            if "folder" in item:
                result["type"]="folder"
                result["childCount"]=item["folder"]["childCount"]
            elif "image" in item:
                    result["type"]="picture"
            elif "video" in item:
                result["type"] = "play-square"
            else:
                result["type"] = "file"
            result["id"] = item["id"]
            result["name"] = item["name"]
            result["size"] = item["size"]
            result["time"] = item["lastModifiedDateTime"]
            items.append(result)
        response["data"]=items
        if "@odata.nextLink" in data:
            response["next"]=data["@odata.nextLink"]
        else:
            response["next"] =None
    except Exception as e:
        response={"error":e.message,"data":data}
    return json.dumps(response)

@app.route('/download')
def download():
    id = request.args.get("id")
    if id:
        path='me/drive/items/{}'.format(id)
        url = base_url + path
        access_token = token["access_token"]
        headers = {
            "Authorization": "bearer {}".format(access_token),
            "Content-Type": "application/json"
        }
        data = requests.get(url, headers=headers).json()
        if not "folder" in data:
            url_download=data["@microsoft.graph.downloadUrl"]
            return redirect(url_download)

@app.before_request
def before(*args,**kwargs):
    global token
    try:
        time_now = time.time()
        time_last = token["time"]
        if time_now - time_last >3500:
            refresh_token = token["refresh_token"]
            scope = token["scope"]
            url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
            headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            data = {
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri_register,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
                "scope": scope,
            }
            data = requests.post(url, data=data, headers=headers).json()
            data["time"] = time.time()
            data["account"] = token["account"]
            data["drive"] = token["drive"]
            token = data
            json_token = json.dumps(data, ensure_ascii=False, indent=4)
            path_token = os.path.join(path_oss_store, filename_token)
            bucket.put_object(path_token, json_token)
    except:
        pass

def init():
    global token,oss_available
    try:
        service = oss2.Service(auth, oss_end_point.replace("http://", ""), connect_timeout=0.5)
        service.list_buckets()
        oss_available=True
        path_token ="{}/{}".format(path_oss_store,filename_token)
        if bucket.object_exists(path_token):
            token = bucket.get_object(path_token)
            token = json.loads(token.read())
    except:
        pass

if __name__=="__main__":
    init()
    app.run()

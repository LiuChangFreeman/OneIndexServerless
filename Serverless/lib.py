# -*- coding: utf-8 -*-
from __future__ import print_function
import os
import oss2
import requests
import urllib
import json
import flask
from flask import request
from flask_oauthlib.client import OAuth
from main import url_host,path_oss_store,filename_token,access_key,access_key_secret,oss_end_point_internal,oss_end_point_public,oss_bucket_name,client_id,client_secret,redirect_uri

#以下请勿更改
path_web_files="web"
filename_config="config.json"
app = flask.Flask(__name__, static_url_path='/static', template_folder='static')
auth = oss2.Auth(access_key,access_key_secret)
bucket = oss2.Bucket(auth, oss_end_point_public, oss_bucket_name)
app.secret_key = 'oneindex'
authority_url = 'https://login.microsoftonline.com/common'
base_url='https://graph.microsoft.com'
api_version='/v1.0/'
auth_endpoint = '/oauth2/v2.0/authorize'
token_endpoint = '/oauth2/v2.0/token'
scopes = ['User.Read', 'Files.ReadWrite.All', 'offline_access']
oauth = OAuth(app).remote_app('microsoft', consumer_key=client_id, consumer_secret=client_secret, request_token_params={'scope': scopes}, base_url=base_url+api_version, request_token_url=None, access_token_method='POST', access_token_url=authority_url + token_endpoint, authorize_url=authority_url + auth_endpoint)
select="id,name,size,folder,image,video,lastModifiedDateTime"
items_per_page=50
token=None

def transfer_size(bytes):
    if bytes < 1024:
        bytes = str(round(bytes, 2)) + ' 字节'
    elif bytes >= 1024 and bytes < 1024 * 1024:
        bytes = str(round(bytes / 1024, 2)) + ' KB'
    elif bytes >= 1024 * 1024 and bytes < 1024 * 1024 * 1024:
        bytes = str(round(bytes / 1024 / 1024, 2)) + ' MB'
    elif bytes >= 1024 * 1024 * 1024 and bytes < 1024 * 1024 * 1024 * 1024:
        bytes = str(round(bytes / 1024 / 1024 / 1024, 2)) + ' GB'
    elif bytes >= 1024 * 1024 * 1024 * 1024 and bytes < 1024 * 1024 * 1024 * 1024 * 1024:
        bytes = str(round(bytes / 1024 / 1024 / 1024 / 1024, 2)) + ' TB'
    return bytes

@app.route('/')
def home():
    if token==None:
        data = {
            "account":None,
        }
    else:
        data = {
            "account":token["account"],
            "url_index": token["url_index"]
        }
    return flask.render_template('home.html',data=data)

@app.route('/login')
def login():
    return oauth.authorize(callback=redirect_uri)

@app.route('/login/authorized')
def authorized():
    global token
    token=oauth.authorized_response()

    config={"host":url_host}
    json_config = json.dumps(config, ensure_ascii=False, indent=4)
    path_config = os.path.join(path_oss_store, filename_config)
    bucket.put_object(path_config, json_config)
    bucket.put_object_acl(path_config,oss2.OBJECT_ACL_PUBLIC_READ)
    for filename in os.listdir(path_web_files):
        file_key=os.path.join(path_oss_store,filename)
        file_path=os.path.join(path_web_files,filename)
        bucket.put_object_from_file(file_key,file_path)
        bucket.put_object_acl(file_key, oss2.BUCKET_ACL_PUBLIC_READ)
    path_oss_index=os.path.join(path_oss_store,"index.html")
    url_index=bucket.sign_url("GET",path_oss_index,-1)
    url_index=urllib.unquote(url_index).split("?")[0]
    url_index=url_index.replace("-internal","")
    token["url_index"] = url_index
    me = oauth.get('me/drive').data
    token["account"]=me["owner"]["user"]["email"]
    token["drive"] = me["id"]
    json_token = json.dumps(token, ensure_ascii=False, indent=4)
    path_token = os.path.join(path_oss_store, filename_token)
    bucket.put_object(path_token, json_token)
    bucket.put_object_acl(path_token,oss2.OBJECT_ACL_PRIVATE)
    return flask.redirect(url_host)

@app.route('/refresh')
def refresh_token():
    global token
    refresh_token =token["refresh_token"]
    scope=token["scope"]
    url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
        "scope": scope,
    }
    result = requests.post(url,data=data,headers=headers)
    json_result=result.json()
    json_result["account"]=token["account"]
    json_result["url_index"] = token["url_index"]
    json_result["drive"] = token["drive"]
    json_token = json.dumps(json_result, ensure_ascii=False, indent=4)
    path_token = os.path.join(path_oss_store, filename_token)
    bucket.put_object(path_token, json_token)
    token=json_result
    return "refreshed"

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
                url = "drives/{}/root:/{}:/children".format(drive, path)
            else:
                url = "me/drive/root/children"
            url = base_url + api_version + url
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
            result["size"]=transfer_size(item["size"])
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
        data = oauth.get(path).data
        if not "folder" in data:
            url_download=data["@microsoft.graph.downloadUrl"]
            return flask.redirect(url_download)

@oauth.tokengetter
def token_getter():
    return (token['access_token'], '')

def init():
    global token
    path_token ="{}/{}".format(path_oss_store,filename_token)
    if bucket.object_exists(path_token):
        token = bucket.get_object(path_token)
        token = json.loads(token.read())

def initializer(context):
    init()

def handler(environ, start_response):
    return app(environ, start_response)

if __name__ == '__main__':
    init()
    app.run()
import fetch from 'dva/fetch';


export async function getHost(){
  const response=await fetch(`./config.json`,{mode: 'cors'});
  const config=await response.json();
  return config["host"]
}

export async function getList(host){
  const url=`${host}/list`;
  const response=await fetch(url,{mode: 'cors'});
  return await response.json();
}

export async function getListByNext(host, next){
  const url=`${host}/list`;
  const postData = {
    next:next
  };
  const response=await fetch(url,{
    headers: {
      "Content-Type": "application/json"
    },
    mode: 'cors',method: 'POST',body: JSON.stringify(postData)
  });
  return await response.json();
}

export async function getListByPath(host, path){
  const url=`${host}/list?path=${path}`;
  const response=await fetch(url,{mode: 'cors'});
  return await response.json();
}

export async function verify(host,code){
  const response=await fetch(`${host}/verify?code=${code}`,{mode: 'cors'});
  return await response.json();
}

export async function getStatus(host){
  const response=await fetch(`${host}/`,{mode: 'cors'});
  let result={};
  let data=[];
  if(response.status!==200){
    data=[
      {"color":"red","text":"函数计算服务异常"}
    ]
  }else{
    let data_json=await response.json();
    data.push({"color":"green","text":"函数计算服务正常"});
    const oss_available=data_json["oss_available"];
    if(oss_available){
      data.push({"color":"green","text":"对象存储服务正常"});
    }
    else{
      data.push({"color":"red","text":"对象存储服务异常"});
    }
    const success=data_json["success"];
    if(success){
      data.push({"color":"green","text":"已登录OneDrive账号"});
      result["account"]=data_json["account"];
    }
    else{
      data.push({"color":"red","text":"未登录OneDrive账号"});
    }
  }
  result["data"]=data;
  return result;
}

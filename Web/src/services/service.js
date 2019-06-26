import fetch from 'dva/fetch';

export async function getHost(){
  let response=await fetch(`./config.json`,{mode: 'cors',credentials: 'include'});
  let config=await response.json();
  return config["host"]
}

export async function getList(host){
  const url=`${host}/list`;
  let response=await fetch(url,{mode: 'cors'});
  return await response.json();
}

export async function getListByNext(host, next){
  const url=`${host}/list`;
  let postData = {
    next:next
  };
  let response=await fetch(url,{
    headers: {
      "Content-Type": "application/json"
    },
    mode: 'cors',method: 'POST',body: JSON.stringify(postData)
  });
  return await response.json();
}

export async function getListByPath(host, path){
  const url=`${host}/list?path=${path}`;
  let response=await fetch(url,{mode: 'cors'});
  return await response.json();
}

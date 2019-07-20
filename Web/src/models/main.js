import { message } from 'antd';
import queryString from  'query-string';
import {getHost, getList,getListByPath,getListByNext} from '../services/service'
export default {
  namespace: 'util',

  state: {
    "login":false,
    "code":null,
    "host":null,
    "loading":true,
    "next":null,
    "data":[],
    "current":null,
    "paths":[],
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(
        async (location) => {
          await dispatch({
            type:'fetchHost'
          });
          if(location.pathname==="/manage"||location.pathname==="/admin"){
            return ;
          }
          dispatch({
            type: 'setNext',
            payload:null,
          });
          let query=queryString.parse(decodeURI(location.search));
          const {path}=query;
          dispatch({
            type: 'setCurrent',
            payload:path,
          });
          let result=[];
          if(path){
            const paths=path.split('/');
            for(var i=0;i<paths.length;i+=1){
              const item={
                path:encodeURI(paths.slice(0,i+1).join('/')),
                name:paths[i]
              };
              result.push(item);
            }
          }
          dispatch({
            type: 'setPaths',
            payload:result,
          });
          dispatch({
            type:'fetchList'
          })
      })
    }
  },

  effects: {
    *fetchHost({ payload }, { call, put,select}) {
      let host = yield select(state => state.util.host);
      if(host===null){
        host = yield call(getHost);
        if(host.endsWith("/")){
          host=host.substr(0,host.length-1);
        }
        yield put({
          type: 'setHost',
          payload: host,
        });
      }
    },
    *fetchList({ payload }, { call, put,select}) {
      yield put({
        type: 'setLoading',
        payload: true,
      });
      const host = yield select(state => state.util.host);
      const paths = yield select(state => state.util.paths);
      let response={};
      if(paths.length===0){
        response=yield call(getList,host);
      }
      else{
        const path=paths[paths.length-1];
        response=yield call(getListByPath,host,path.path);
      }
      if("error" in response){
        message.error(response["data"]["error"]["message"],2);
        let result={};
        result["next"]=null;
        result["data"]=[];
        yield put({
          type: 'setDataAndNext',
          payload: result,
        });
      }
      else{
        yield put({
          type: 'setDataAndNext',
          payload: response,
        });
      }
      yield put({
        type: 'setLoading',
        payload: false,
      });
    },
    *fetchNext({ payload }, { call, put,select}) {
      yield put({
        type: 'setLoading',
        payload: true,
      });
      const  host = yield select(state => state.util.host);
      const next = yield select(state => state.util.next);
      const data = yield select(state => state.util.data);
      const response=yield call(getListByNext,host,next);
      if("error" in response){
        message.error(response["data"]["error"]["message"],2);
        let result={};
        result["next"]=null;
        result["data"]=[];
        yield put({
          type: 'setDataAndNext',
          payload: result,
        });
      }else{
        let result={};
        result["next"]=response["next"];
        result["data"]=data.concat(response["data"]);
        yield put({
          type: 'setDataAndNext',
          payload: result,
        });
      }
      yield put({
        type: 'setLoading',
        payload: false,
      });
    },
    *setLoginStatus({ payload }, { put }) {
      yield put({
        type: 'setLogin',
        payload: payload.status,
      });
    },
    *setVerifyCode({ payload }, { put }) {
      yield put({
        type: 'setCode',
        payload: payload.hash,
      });
    },
  },

  reducers: {
    setHost(state, action) {
      return { ...state,
        host: action.payload,
      };
    },
    setPaths(state, action) {
      return { ...state,
        paths: action.payload,
      };
    },
    setLoading(state, action) {
      return { ...state,
        loading: action.payload,
      };
    },
    setCurrent(state, action) {
      return { ...state,
        current: action.payload,
      };
    },
    setNext(state, action) {
      return { ...state,
        next: action.payload,
      };
    },
    setDataAndNext(state, action) {
      return { ...state,
        data: action.payload.data,
        next: action.payload.next,
      };
    },
    setLogin(state, action) {
      return {
        ...state,
        login: action.payload,
      };
    },
    setCode(state, action) {
      return {
        ...state,
        code: action.payload,
      };
    },
  },

};

import queryString from  'query-string';
import {getHost, getList,getListByPath,getListByNext} from '../services/service'
export default {
  namespace: 'util',

  state: {
    "host":null,
    "loading":true,
    "next":null,
    "data":[],
    "current":null,
    "paths":[],
  },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      history.listen(async (location) => {
        dispatch({
          type: 'setNext',
          payload:null,
        });
        let query=queryString.parse(location.search);
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
              path:decodeURI(paths.slice(0,i+1).join('/')),
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
    *fetchList({ payload }, { call, put,select}) {
      yield put({
        type: 'setLoading',
        payload: true,
      });
      let host = yield select(state => state.util.host);
      if(host===null){
        host = yield call(getHost);
        yield put({
          type: 'setHost',
          payload: host,
        });
      }
      const paths = yield select(state => state.util.paths);
      let response={};
      if(paths.length===0){
        response=yield call(getList,host);
      }
      else{
        const path=paths[paths.length-1];
        response=yield call(getListByPath,host,path.path);
      }
      yield put({
        type: 'setDataAndNext',
        payload: response,
      });
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
      let host = yield select(state => state.util.host);
      if(host===null){
        host = yield call(getHost);
        yield put({
          type: 'setHost',
          payload: host,
        });
      }
      const next = yield select(state => state.util.next);
      const data = yield select(state => state.util.data);
      const response=yield call(getListByNext,host,next);
      let result={};
      result["next"]=response["next"];
      result["data"]=data.concat(response["data"]);
      yield put({
        type: 'setDataAndNext',
        payload: result,
      });
      yield put({
        type: 'setLoading',
        payload: false,
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

  },

};

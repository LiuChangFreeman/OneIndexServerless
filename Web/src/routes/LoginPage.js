import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Input, Row, Col, message} from 'antd'
import {verify} from '../services/service'
import Base64  from 'base-64';

const Search = Input.Search;

@connect(({  util}) => ({
  util,
}))
class LoginPage extends PureComponent {

  async onSearch(value){
    const { host }=this.props.util;
    const { history,dispatch } = this.props;
    let hash = Base64.encode(value);
    let result=await verify(host,hash);
    const success=result["success"];
    if(success){
      const status=true;
      dispatch({
        type: 'util/setLoginStatus',
        payload: {
          status,
        },
      });
      dispatch({
        type: 'util/setVerifyCode',
        payload: {
          hash,
        },
      });
      history.push('/manage');
    }
    else{
      message.error("密码错误!",3);
      this.setState({
        data:null
      })
    }
  };

  render() {
    return (
      <Row
        type="flex"
        justify="space-around"
        align="middle"
        style={{ minHeight: '70vh' }}
      >
        <Col span={12}>
          <Search
            placeholder="输入密码"
            onSearch={value => this.onSearch(value)}
            style={{marginBottom:"64px"}}
            enterButton
          />
        </Col>
      </Row>

    );
  }
}

export default LoginPage;

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Menu, Timeline, Layout, Row,Comment,Avatar,
  Icon, LocaleProvider,Button
} from 'antd'
import {getStatus, getHost} from '../services/service'
import zhCN from 'antd/lib/locale-provider/zh_CN';
const { Content,Sider } = Layout;

@connect(({ util}) => ({
  util,
}))
class ManagePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      data:[],
      account:null,
      current: 'status',
      loading:false
    };
    const { history,util } = this.props;
    if(util.login===false){
      history.push('/admin');
    }
    console.log(util);
    this.getStatus();
  }

  async getStatus(){
    this.setState({
      loading:true
    });
    const {host}=this.props.util;
    const result=await getStatus(host);
    this.setState({
      loading:false,
      data:result["data"]
    });
    if("account" in result){
      this.setState({
        account:result["account"]
      });
    }
  }

  login = () => {
    const href=window.location.href;
    const {host,code}=this.props.util;
    const url=`${host}/login?code=${code}&final=${href}`;
    window.open(url,"_blank");
  };

  handleClick= e => {
    this.setState({
      current: e.key
    });
  };

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };

  render() {
    const{current,data,account}=this.state;
    return (
      <LocaleProvider locale={zhCN}>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider theme="light" collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
            <Menu
              onClick={this.handleClick}
              selectedKeys={[this.state.current]}
              mode="inline"
              theme="light"
            >
              <Menu.Item key="status">
                <Icon type="info-circle" />
                <span>系统状态</span>
              </Menu.Item>
              <Menu.Item key="account">
                <Icon type="cloud" />
                <span>账号管理</span>
              </Menu.Item>
              <Menu.Item key="about">
                <a
                  href="https://github.com/LiuChangFreeman/OneIndex-Serverless"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                <Icon type="message" />
                  <span>
                      关于OneIndex
                  </span>
                </a>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content>
            <Row
              type="flex"
              justify="space-around"
              style={{ marginTop: '96px',height:"100%" }}
            >
              {
                current==="status"&&
                <Timeline>
                  {data.map((item, index)=>{
                    return <Timeline.Item color={item.color}>
                         <p>{item.text}</p>
                      </Timeline.Item>
                  })}
                </Timeline>
              }
              {
                current==="account"&&
                  <div>
                    <Comment
                      author={
                        account? <p>{account}</p>: <p>暂无账号</p>
                      }
                      avatar={
                        <Avatar icon="user" shape="square" size={64}/>
                      }
                      content={
                        <Button onClick={this.login}>
                          {
                            account?"切换":"登录"
                          }
                        </Button>
                      }
                    />

                  </div>
              }
            </Row>
          </Content>
        </Layout>
      </LocaleProvider>
    );
  }
}

export default ManagePage;

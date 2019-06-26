import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Row, Col, Spin,List,Icon,
  Skeleton,
  LocaleProvider,Breadcrumb
} from 'antd'
import InfiniteScroll from 'react-infinite-scroller';
import {Link} from 'dva/router';
import {renderTime} from '../utils/uitls'
import zhCN from 'antd/lib/locale-provider/zh_CN';

@connect(({ util}) => ({
  util,
}))
class MainPage extends PureComponent {
  handleInfiniteOnLoad = async () => {
    console.log("more");
    const{dispatch}=this.props;
    await dispatch({
      type:'util/fetchNext'
    })
  };
  render() {
    const {data,paths,current,loading,next,host}=this.props.util;
    return (
      <LocaleProvider locale={zhCN}>
        <div>
          <Row
            style={{ minHeight: '8vh' }}
            type="flex"
            justify="space-around"
            align="middle"
          >
            <Breadcrumb separator=">">
              <Breadcrumb.Item >
                <Link to='/?path='>
                  <Icon type="home" />
                </Link>
              </Breadcrumb.Item>
              {paths.map((item,index)=>{
                  return <Breadcrumb.Item key={index}>
                    <Link to={`/?path=${item.path}`}>{item.name}</Link>
                  </Breadcrumb.Item>
              })}
            </Breadcrumb>
          </Row>
          {
            loading&&next===null&&
            <Row
              type="flex"
              justify="space-around"
              align="middle"
            >
              <Spin tip="加载中......"/>
            </Row>
          }
          <Row
            type="flex"
            justify="center"
          >
            <Col
              xs={23}
              md={18}
              style={{
                border: '1px solid #ccc',
                boxShadow:'0 0 5px #ccc',
              }}
            >
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={this.handleInfiniteOnLoad}
                hasMore={!loading &&next!==null}
                useWindow={true}
              >
                <List
                  size="normal"
                  dataSource={data}
                  renderItem={item => (
                    <List.Item>
                      <Row
                          style={{width:'100%'}}
                          type="flex"
                          justify="space-around"
                          align="middle"
                        >
                          <Col xs={12} md={18}>
                            <Icon
                              type={item.type}
                              theme="twoTone"
                              style={{width:'48px'}}
                            />
                            {
                              item.type === "folder" ? (
                                current? <Link to={`/?path=${current}/${item.name}`}>{item.name}</Link>:
                                  <Link to={`/?path=${item.name}`}>{item.name}</Link>
                              ) : (
                                <a href={`${host}/download?id=${item.id}`} target="_blank"  rel="noopener noreferrer">
                                  {item.name}
                                </a>
                              )
                            }

                          </Col>
                          <Col xs={7} md={4}>
                            <div
                              style={{
                                verticalAlign:'middle',
                                display:'table-cell'
                              }}>
                              {renderTime(item.time)}
                            </div>
                          </Col>
                          <Col xs={5} md={2}>
                            <div
                              style={{
                                textAlign:'center',
                                verticalAlign:'middle',
                                display:'table-cell'
                              }}>
                              {item.size}
                            </div>
                          </Col>
                        </Row>
                    </List.Item>
                  )}
                >
                  {
                    loading&&next!==null&&
                    <Row
                      type="flex"
                      justify="space-around"
                      align="middle"
                    >
                      <Spin tip="加载中......"/>
                    </Row>
                  }
                </List>
              </InfiniteScroll>
            </Col>

          </Row>
        </div>
      </LocaleProvider>
    );
  }
}

export default MainPage;

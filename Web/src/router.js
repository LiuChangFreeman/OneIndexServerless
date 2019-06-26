import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import MainPage from './routes/MainPage';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={MainPage}/>
        <Route path="/detail" exact component={MainPage}/>
      </Switch>
    </Router>
  );
}

export default RouterConfig;

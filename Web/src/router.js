import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import MainPage from './routes/MainPage';
import LoginPage from './routes/LoginPage';
import ManagePage from './routes/ManagePage';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={MainPage}/>
        <Route path="/manage" exact component={ManagePage}/>
        <Route path="/admin" exact component={LoginPage}/>
      </Switch>
    </Router>
  );
}

export default RouterConfig;

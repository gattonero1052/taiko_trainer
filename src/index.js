import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Load from './load';
import Demo from './demo';
import Raw from './rawdemo';
import Menu from "./menu";
import Play from "./play2";
import {
    MemoryRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
      <Router>
          <Switch>
              <Route path={'/'} exact={true}>
                  <Load/>
              </Route>
              <Route path={'/menu'} exact={true}>
                  <Menu/>
              </Route>
              <Route path={'/practise'} exact={true}>
                  <Play/>
              </Route>
          </Switch>
      </Router>,
  </React.StrictMode>,
  document.getElementById('root')
);
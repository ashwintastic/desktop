/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import BrandingPage from './containers/BrandingPage';
import ExperimentMainPage from './containers/ExperimentMainPage';
import Home from './containers/HomePage'


export default () => (
  <App>
    <Switch>
      <Route path="/detailedexperiment" component={ExperimentMainPage} />
      <Route path="/homePage" component={Home} />
      <Route path="/" component={BrandingPage} />
    </Switch>
  </App>
);

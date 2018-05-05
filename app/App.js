import * as React from 'react';
import {Switch, Route, withRouter} from 'react-router';
import RoutePropagator from '@shopify/react-shopify-app-route-propagator';

import Settings from './Settings';
import NotFound from './NotFound';
import Home from './Home';

const Propagator = withRouter(RoutePropagator);

export default function() {
  return (
    <React.Fragment>
      <Propagator />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
  );
}

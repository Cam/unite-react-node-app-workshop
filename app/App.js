import * as React from 'react';
import {Switch, Route} from 'react-router';

import Settings from './Settings';
import NotFound from './NotFound';
import Home from './Home';

export default function() {
  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
  );
}

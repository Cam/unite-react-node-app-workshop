import * as React from 'react';
import {Switch, Route, withRouter} from 'react-router';
import RoutePropagator from '@shopify/react-shopify-app-route-propagator';
import ApolloClient, {ApolloLink} from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';

import Settings from './Settings';
import NotFound from './NotFound';
import Home from './Home';

const Propagator = withRouter(RoutePropagator);
const isServer = typeof window === 'undefined';
const client = new ApolloClient({
  ssrMode: isServer,
  uri: '/graphql',
  fetchOptions: {
    credentials: 'include',
  },
});

export default function() {
  return (
    <ApolloProvider client={client}>
      <React.Fragment>
        <Propagator />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    </ApolloProvider>
  );
}

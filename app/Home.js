import * as React from 'react';
import {Link} from 'react-router-dom';
import Fetch from 'react-fetch-component';
import {Query} from 'react-apollo';

import GameList from './GameList';
import ProductList from './ProductList';
import {GET_GAMES} from './queries';

const API_URL = 'https://bgg-json.azurewebsites.net/hot';

export default function Home() {
  return (
    <div>
      <h1>Board game loader</h1>
      <Fetch url={API_URL} as="json">
        {({loading, error, data}) => {
          if (loading) {
            return <p>loading</p>;
          }
          if (error) {
            return <p>failed to fetch games</p>;
          }

          return <GameList games={data} />;
        }}
      </Fetch>

      <h2>Most recent products</h2>
      <Query query={GET_GAMES}>
        {({loading, error, data}) => {
          if (loading) {
            return <p>loading</p>;
          }

          if (error) {
            return <p>failed to fetch products</p>;
          }

          if (data) {
            console.log(data);
            const products = data.shop.products.edges.map(({node}) => node);

            return <ProductList products={products} />;
          }
        }}
      </Query>
      <Link to="/settings">settings</Link>
    </div>
  );
}

import * as React from 'react';
import {Link} from 'react-router-dom';
import Fetch from 'react-fetch-component';

import GameList from './GameList';

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
      <Link to="/settings">settings</Link>
    </div>
  );
}

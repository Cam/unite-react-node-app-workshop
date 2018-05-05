import React from 'react';
import {Link} from 'react-router-dom';

import GameList from './GameList';

const API_URL = 'https://bgg-json.azurewebsites.net/hot';

export default class Home extends React.Component {
  state = {
    games: [],
  };

  componentDidMount() {
    fetch(API_URL, {mode: 'cors'})
      .then((response) => response.json())
      .then((games) => this.setState({games}));
  }

  render() {
    return (
      <div>
        <h1>Board game loader</h1>
        <GameList games={this.state.games} />
        <Link to="/settings">settings</Link>
      </div>
    );
  }
}

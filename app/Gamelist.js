import * as React from 'react';

export default function GameList({games = []}) {
  const gameItems = games.map(({name}) => (
    <li key={name}>
      {name}
      <button>Add</button>
    </li>
  ));

  return <ul>{gameItems}</ul>;
}

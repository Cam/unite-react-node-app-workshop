import React from 'react';

import GameItem from './GameItem';

export default function GameList({games = []}) {
  const gameItems = games.map((game) => (
    <GameItem key={game.name} game={game} />
  ));

  return <ul>{gameItems}</ul>;
}

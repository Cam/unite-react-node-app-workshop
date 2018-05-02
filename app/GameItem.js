import React from 'react';

export default function GameItem({game: {name}}) {
  return (
    <li>
      <p>{name}</p>
      <button>Create product</button>
    </li>
  );
}

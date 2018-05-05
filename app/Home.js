import React from 'react';
import {Link} from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Board game loader</h1>
      <p>
        <Link to="/settings">settings</Link>
      </p>
    </div>
  );
}

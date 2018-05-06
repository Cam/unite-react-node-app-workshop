import React from 'react';
import {Mutation} from 'react-apollo';

import {CREATE_PRODUCT, GET_GAMES} from './queries';

export default function GameItem({game: {name}}) {
  return (
    <Mutation mutation={CREATE_PRODUCT} refetchQueries={[{query: GET_GAMES}]}>
      {(createProduct, {data, error, loading}) => {
        return (
          <li>
            <p>{name}</p>
            <button
              onClick={(event) => {
                event.preventDefault();

                createProduct({
                  variables: {
                    product: {
                      title: name,
                      productType: 'Board game',
                    },
                  },
                });
              }}
            >
              Create product
            </button>

            {loading && ' loading...'}
            {error && ' ❌'}
            {data && ' ✅'}
          </li>
        );
      }}
    </Mutation>
  );
}

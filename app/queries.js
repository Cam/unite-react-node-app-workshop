import {gql} from 'apollo-boost';

export const GET_GAMES = gql`
  query ProductsQuery {
    shop {
      products(first: 100, sortKey: CREATED_AT, reverse: true) {
        edges {
          cursor
          node {
            id
            title
            productType
          }
        }
      }
    }
  }
`;

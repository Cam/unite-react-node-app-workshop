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

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($product: ProductInput!) {
    productCreate(input: $product) {
      product {
        id
        title
      }
    }
  }
`;

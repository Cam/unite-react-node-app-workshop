import dotenv from 'dotenv';
import Koa from 'koa';
import session from 'koa-session';
import webpack from 'koa-webpack';
import createShopifyAuth, {
  createVerifyRequest,
} from '@shopify/koa-shopify-auth';
import graphQLProxy from '@shopify/koa-shopify-graphql-proxy';

import renderReactApp from './render-react-app';

import renderReactApp from './render-react-app';

dotenv.config();
const {SHOPIFY_API_KEY, SHOPIFY_SECRET} = process.env;

const app = new Koa();

app.keys = [SHOPIFY_SECRET];

app.use(session(app));

app.use(
  createShopifyAuth({
    apiKey: SHOPIFY_API_KEY,
    secret: SHOPIFY_SECRET,
    scopes: ['read_products, write_products'],
    afterAuth(ctx) {
      const {shop, accessToken} = ctx.session;

      console.log('We did it!', accessToken);

      ctx.redirect('/');
    },
  }),
);

app.use(createVerifyRequest());

app.use(webpack());

app.use(graphQLProxy);

app.use(renderReactApp);

export default app;

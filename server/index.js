import dotenv from 'dotenv';
import Koa from 'koa';
import session from 'koa-session';
import createShopifyAuth from '@shopify/koa-shopify-auth';

dotenv.config();
const {SHOPIFY_API_KEY, SHOPIFY_SECRET} = process.env;

const app = new Koa();

app.keys = [SHOPIFY_SECRET];

app.use(session(app));

app.use(
  createShopifyAuth({
    apiKey: SHOPIFY_API_KEY,
    secret: SHOPIFY_SECRET,
    scopes: ['write_orders, write_products'],
    afterAuth(ctx) {
      const {shop, accessToken} = ctx.session;

      console.log('We did it!', accessToken);

      ctx.redirect('/');
    },
  }),
);

app.use(function index(ctx) {
  ctx.body = 'Hello koa :)';
});

export default app;

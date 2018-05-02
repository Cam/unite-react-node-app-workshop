import dotenv from 'dotenv';
import Koa from 'koa';

dotenv.config();

const app = new Koa();

app.use(function index(ctx) {
  ctx.body = 'Hello Unite :)';
});

export default app;

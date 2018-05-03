# Building a Shopify App

_with React and Koa_

### Workshop overview

Together we will be building a Shopify app that creates products from a list of board games fetched from [boardgamegeek.com](https://boardgamegeek.com/).

### Goals

* Give attendees a running start building a modern web-app using Shopify’s tools for the Node and React ecosystems.
* Raise awareness with attendees about what libraries we have available for building apps.
* Level up attendees skills with modern javascript libraries.

#### Structure

* Introduction
  * Babel and ES6
* Let’s build an app!
  * Cloning the repo
  * Hello Koa
  * Authing with Shopify
  * React and webpack
  * Our first React component
  * Routing with react
  * Fetching some games from boardgamegeek
  * Creating a new product with graphQL
  * Wrapup and potential next steps
* Q & A

At the end of this workshop you will have built something that looks like this.

![Index page screenshot](public/images/index-screenshot.png)

### Let’s build an app!

#### Step 1. Set up and intro to Koa

If you have not done so already, follow the steps in the [README](./README.md).

In the root of this project, there are a number of configurations files and index.js, this is the entry point of our application which imports server/index.js and mounts it on port 3000.

If you open the `server/index.js` you will see of our "hello Koa" logic.

Koa is the server framework we’ll be using for our server. It’s a minimalistic framework for modern JS apps, built around the `async` and `await` keywords.

In Koa you express your application logic as a series of asynchronous functions called middleware. These functions all operate on a `context` or `ctx` object, and await on a `next` function to yield flow back into the rest of the app.

#### Step 2: Authing with Shopify

Let's get our app to show up in our Shopify store. We'll use the koa auth package that Shopify provides. Install it by running:

```bash
npm install koa-session @shopify/shopify-koa-auth
```

And import it into our Koa app, in server/index.js add the following lines.

```js
import session from 'koa-session';
import webpack from 'koa-webpack';
```

We can grab our `SHOPIFY_SECRET` from the environment.

```js
const {SHOPIFY_API_KEY, SHOPIFY_SECRET} = process.env;
```

Now add `app.keys` to let us use session securely. Set this to your Shopify secret.

```js
app.keys = [SHOPIFY_SECRET];
```

Next we need to use the session middleware.

```js
app.use(session());
```

Next we need to use the Shopify Auth Middleware. To configure it we'll need to pass the apiKey, our secret and what permissions we need from the stores we are installed in. In our case we are asking to read products and write to them.

We also need to define our own `afterAuth` function. This tells our app what to do when an authentication successfully completes. We will just print a message and redirect to the root or our app.

```js
.use(createShopifyAuth({
   apiKey: SHOPIFY_API_KEY,
   secret: SHOPIFY_SECRET,
   scope: ['read_products, write_products'],
   afterAuth(ctx) {
     const { shop, accessToken } = ctx.session;

     console.log('We did it!', accessToken);

     ctx.redirect('/');
   }
}))
```

To try out our authenticate flow, lets visit `YOUR_NGROK_URL/auth?shop=YOUR_SHOP_DOMAIN`.

You should see a error screen that states:

```
Oauth error invalid_request: The redirect_uri is not whitelisted
```

(Add image)

To solve this we need to login to our partners dashboard, go to our App Info and add `YOUR_NGROK_URL/auth/callback` to "Whitelisted redirection URL(s)" textarea.

Now if you try to authenicate again, it take you to install the app in the Shopify admin. Once its installed you can verify it shows by going to to `YOUR_SHOPIFY_URL/admin/apps`.

#### Step 3: Adding Verify Request

We now have an authentication route, but users can still go straight to our index without logging in. The next step will be to protect our `Hello Koa` with a verification middleware.

The `@shopify/koa-shopify-auth` package exports a middleware for this exact purpose.

```
import createShopifyAuth, {createVerifyRequest} from '@shopify/koa-shopify-auth';
```

Now we can add the following between our Auth and Hello World middlewares.

```js
app.use(createVerifyRequest());
```

#### Step 4: Adding Verify Request

Before we can get started building the frontend of our application in earnest, we need to get our environment setup to bundle our react code together.

We’ll use webpack 4 for this. Webpack is an open-source JavaScript module bundler. It consumes your client side code, traverses it’s dependencies, and generates static assets representing those modules.

Again, first step is to install the packages we need. We need webpack and a the koa-webpack middleware.

```bash
npm install webpack koa-webpack
```

Import the `koa-webpack` middleware and add it to the very bottom of our middle ware chain, we add:

```js
app.use(webpack());
```

#### Step 5: Our first React component

#### Step 6: Routing with react

#### Step 7: Making an API request

#### Step 8: Webhooks

Now we are ready to get our app to to talk to Shopify, but first we need to authenticate

If you need to catch up on step one, go ahead and run git stash && git checkout step3 in your terminal.

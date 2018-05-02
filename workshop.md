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

#### Step 1. Set up and intro to Koa (Mal)

If you have not done so already, follow the steps in the [README](./README.md).

In the root of this project, there are a number of configurations files and a few javascript files to get us started. Open up index.js, this is the entry point of our application which imports `server/index.js` and mounts it on port 3000.

If you open the `server/index.js` you will see of our "Hello Unite!" logic. We've also set a few things up so that we can use our `SHOPIFY_SECRET` and `SHOPIFY_API_KEY` using a library called `dotenv`, but more on that later.

Koa is a minimalistic node framework for modern Javascript apps that we will be using for our server in this workshop. It is built around the ES2016 `async` and `await` keywords.

In Koa you express your application logic as a series of asynchronous functions called middleware. These functions all operate on a `context` or `ctx` object, and await on a `next` function to yield flow back into the rest of the app. Let's write some code to better explain this concept.

We are going to add another middleware function. This going to be an `aysnc` function with a second `next` paramater. This is a function that resolves to a promise that we can `await` on, telling Koa to pause this current middleware and move on to the next one in the chain.

```js
app.use(async function(ctx, next) {
  console.log('Middleware 1');
  await next();
});
```

If you refresh the browser where you are running the app it should still look the same, but you should see `Middleware 1` printed in the console. Let's add another middleware, but this time after our initial middleware. So our entire middleware chain looks like this.

```js
app.use(async function(ctx, next) {
  console.log('Middleware 1');
  await next();
});

app.use(function index(ctx) {
  console.log(`Middleware 2`);
  ctx.body = 'Hello Unite :)';
});

app.use(async function(ctx, next) {
  console.log('Middleware 3');
  await next();
});
```

If you refresh the browser, you should see `Middleware 1` and `Middleware 2` printed in the console, but not `Middleware 3`.  That’s because Koa ends the request once the middleware Promise chain is resolved. That means the response was sent to the client before we got to our third middleware. We can solve this by changing our index function into an `async` function that has `await next()` like our other middleware does.

We said Koa "pauses" the excecution of the function, so let's log some messages after our `next()` calls to get a better idea of what is meant by this.

```js
app.use(async function(ctx, next) {
  console.log('Middleware 1');
  await next();
  console.log('Middleware 1 after next()');
});

app.use(async function index(ctx, next) {
  console.log(`Middleware 2`);
  ctx.body = 'Hello Unite :)';
  await next();
  console.log('Middleware 2 after next()');
});

app.use(async function(ctx, next) {
  console.log('Middleware 3');
  await next();
  console.log('Middleware 3 after next()');
});
```

This time in the console, we see this:

```bash
Middleware 1
Middleware 2
Middleware 3
Back to Middleware 3
Back to Middleware 2
Back to Middleware 1
```

As you can see, Koa made its way up the middleware chain pausing each function when we `await` on `next()` before passing the flow to the next middleware in the chain. It does this until there are no more middleware left and then it resumes each middleware in the reverse order they were added.

Hopefully that gave you a good primer on Koa, we will be using installing and using some Koa middleware packages from npm as well as writing our own middlelware through out this workshop.

#### Step 2: Authing with Shopify (Mal)

Let's get our app to show up in our Shopify store. We'll use the koa auth package that Shopify provides. Install it by running:

```bash
npm add koa-session @shopify/shopify-koa-auth
```

In server/index.js add the following lines to import it into our app.

```js
import session from 'koa-session';
import createShopifyAuth from '@shopify/koa-shopify-auth';
```

We can mount our middlware by adding the following lines after we intialize our new Koa app.

```js
app.use(session());
```

Next we need to use the Shopify Auth Middleware. To configure it we'll need to pass the apiKey, our secret and what permissions we need from the stores we are installed on. In our case we are asking to read products and write to them.

We also need to define our own `afterAuth` function. This tells our app what to do when an authentication successfully completes. We will just print a message and redirect to the root or our app.

```js
app.use(createShopifyAuth({
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

We can grab both our `SHOPIFY_SECRET` and `SHOPIFY_API_KEY` from the environment.

```js
const {SHOPIFY_API_KEY, SHOPIFY_SECRET} = process.env;
```

Finally we add `app.keys` to let us use session securely. Set this to your Shopify secret before we mount our session middleware.

```js
app.keys = [SHOPIFY_SECRET];
```

To try out our authenticate flow, lets visit `YOUR_NGROK_URL/auth?shop=YOUR_SHOP_DOMAIN`.

You should see a error screen that states:

```
Oauth error invalid_request: The redirect_uri is not whitelisted
```

(Add image)

To solve this we need to login to our partners dashboard, go to our App Info and add `YOUR_HTTPS_NGROK_URL/auth/callback` to "Whitelisted redirection URL(s)" textarea.

Now if you try to authenicate again, (`YOUR_HTTPS_NGROK_URL/auth?shop=YOUR_SHOP_DOMAIN`) it should take you to install the app in the Shopify admin. Once its installed you can verify it shows by going to to `YOUR_SHOPIFY_URL/admin/apps`.

#### Step 3: Adding Verify Request (Mal)

We now have an authentication route, but users can still go straight to our index without logging in. The next step will protect our `Hello Unite` with a verification middleware.

The `@shopify/koa-shopify-auth` package exports a middleware for this exact purpose.

```
import createShopifyAuth, {createVerifyRequest} from '@shopify/koa-shopify-auth';
```

Now we can add the following between our Auth and Hello World middlewares.

```js
app.use(createVerifyRequest());
```

#### Step 4: Adding Webpack (Matt)

Before we can get started building the frontend of our application in earnest, we need to get our environment setup to bundle our react code together.

We’ll use webpack 4 for this. Webpack is an open-source Javascript module bundler. It consumes your client side code, traverses it’s dependencies, and generates static assets representing those modules.

Again, first step is to install the packages we need, `webpack` and the `koa-webpack middleware`.

```bash
npm add webpack koa-webpack
```

Import the `koa-webpack` middleware and add it to the bottom of our middleware chain:

```js
app.use(webpack());
```

This middleware will look for a `webpack.config.js` in the project root and that will tell webpack how to compile our code. For our app, we want to run our `js` files through the `babel-loader`, but we've pre-configured wepback for you.

Lastly, we need to add the entry point to our client-side bundle. Create a folder called 'client' and put an empty `index.js` in that folder.

#### Step 5: Hello React (Matt)
For this step we are going to need both `react` and `react-dom`. Let's start by installing those.

```bash
npm add react react-dom
```

Next we are going to mount a react application in our client side bundle. reactDom.render tells react to mount a component (or jsx expression), at a specific point in the DOM. In our code we are querying for an element with the id `app` and using that element to as the place to mount our client-side react app.

```
import React from 'react';
import ReactDOM from 'react-dom';

const title = 'My Shopify app';

ReactDOM.render(<div>{title}</div>, document.getElementById('app'));
```

But where does this element with the `app` id come from? Well sometimes you will have a template on the server-side that will contain the shell of the application, the Head, Html and Body elements as well as the div for react to mount on.

However, in our app we are going to go one step further and actually render our app on the server. Let's write some custom middleware for that.

Create a new file called `render-react-app.js` inside of our server folder and add the following code.

```
import React from 'react';
import {renderToString} from 'react-dom/server';
import HTML from '@shopify/react-html';

export default (ctx) => {
  const markup = renderToString(
    <HTML deferedScripts={[{path: 'bundle.js'}]}>
      <div>{'Hello React'}</div>
    </HTML>,
  );

  ctx.body = markup;
};
```

We need to tell our Koa app to use this middleware, so back in `server/index.js` import the file. We are going to replace the last middleware in our chain with our custom one.

```diff
// after other imports
+ import renderReactApp from './render-react-app';

// after other middleware
- app.use(function index(ctx) {
-   ctx.body = 'Hello Unite :)';
- });
+ app.use(renderReactApp);
```

You should now see "Hello React", which is great but we actually want to render our client side application here, not just a random string. To do this we need to start thinking in components.

#### Step 6: Our first React Component (Matt)
Lets start with out main App component. Create a new file inside of `/app` called `App.js`, this is where we will define our first component, a simple component that renders a title for our page.

```
import React from 'react';

export default function() {
  return (
    <div>
      <h1>Board game loader</h1>
    </div>
  );
}
```

Now we can import it in `client/index.js`.

```
import React from 'react';
import ReactDOM from 'react-dom';

import App from '../app/App';

ReactDOM.render(<App />, document.getElementById('app'));
```

As well as in our server template in `server/index.js`

```diff
import React from 'react';
import {renderToString} from 'react-dom/server';
import HTML from '@shopify/react-html';

+ import App from '../app/App';

export default (ctx) => {
  const markup = renderToString(
    <HTML deferedScripts={[{path: 'bundle.js'}]}>
-      <div>{title}</div>
+      <App />
    </HTML>,
  );

  ctx.body = markup;
}
```

We now have the same component mounted on the server as well as the client. Nice!

#### Step 7: Routing with react (Matt)
You are most likely going to need some routes in your Shopify app, so let's do that here. We are going to use React Router 4. It lets us describe our routes declaratively using react components.

Let’s install the libraries we need:

```bash
npm add react-router react-router-dom
```

Now in App.js lets wrap our application in a a `Switch`, and a `Route`.

```diff
import * as React from 'react';
+ import { Switch, Route } from 'react-router'

export default function({children}) {
 return (
+   <Switch>
+     <Route exact path="/">
        <div>
          <h1>Board game loader</h1>
        </div>
+     </Route>
+   </Switch>
 );
};
```
And because we are using server side rendering, we need to add the `StaticRouter` component from react-router to our `server/render-react-app.js` middleware.

```diff
import * as React from 'react';
import {renderToString} from 'react-dom/server';
import HTML from '@shopify/react-html';
+ import {StaticRouter} from 'react-router';

import App from '../app/App';

export default (ctx) => {
  const markup = renderToString(
    <HTML deferedScripts={[{path: 'bundle.js'}]}>
+       <StaticRouter location={ctx.url} context={{}}>
          <App />
+       </StaticRouter>
    </HTML>,
  );

  ctx.body = markup;
};
```

So nothing much has changed… but let’s add another route to our Switch.

```
<Route exact path="/settings">
   <div>
     <h1>Settings</h1>
   </div>
</Route>
```

Now if you navigate to `/settings` you should see the Setting heading on the page.

#### Excercise
Lets take a few minutes for a quick independent excercise.
1. See if you can add a few routes to your own application, including a NotFound route and component.

Our App.js file is getting pretty large and eventually will get unmanageable. Let’s pull our pages into their own component files.

#### Step 8: Getting our url bar to update (Mal)

We've built a package to make synchronizing Shopify embedded app's client side routing with the outer iframe host. Let's install that package and use it in our app.

```bash
npm add @shopify/react-shopify-app-route-propagator
```

This component is trivially easy to use. We just need to mount the `RoutePropagator` component at the top level of your app and give it access to our router by using the `withRouter` higher order function from `react-router`.

```diff
import * as React from 'react';
+ import {Switch, Route, withRouter} from 'react-router';
+ import RoutePropagator from '@shopify/react-shopify-app-route-propagator';

import Settings from './Settings';
import NotFound from './NotFound';
import Home from './Home';

+ const Propagator = withRouter(RoutePropagator);

export default function() {
  return (
    <React.Fragment>
+     <Propagator />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
  );
}
```

You should now see the url change as you navigate to different areas of your embedded app.

#### Step 9: Fetching some games (Mal)
So we have a routes to build our app on, but we don’t have any interactivity yet. Let’s change that. 

First we’ll want to be able to list some games, so let’s create a new file called `GameList.js` inside our our app folder.

```js
import * as React from 'react';

export default function GameList({games = []}) {
  const gameItems = games.map(({name}) => (
    <li key={name}>
      {name}
      <button>Add</button>
    </li>
  ));

  return <ul>{gameItems}</ul>;
}
```

In Home.js we’ll import it and use it:

```diff
import React from 'react';
import {Link} from 'react-router-dom';

+ import GameList from './Gamelist';

export default function Home() {
  return (
    <div>
      <h1>Board game loader</h1>
      <p>
+       <GameList games={[]} />
        <Link to="/settings">settings</Link>
      </p>
    </div>
  );
}
```

This won’t render anything yet, so we’ll have to add logic to fetch some games for us to render. At this point, we also need to convert the component into a class because we are going give it some `state` and use the `ComponentDidMount` react lifecycle hook.

Our games are going to be coming from the Board Game Geek api at [https://bgg-json.azurewebsites.net/hot](https://bgg-json.azurewebsites.net/hot), lets store this in a constant at the top of our file.

```js
const API_URL = 'https://bgg-json.azurewebsites.net/hot';
```

Next we are going intialize some state, which will later store the the results from our API call.

```js
 state = {
   games: []
 }
```

Now let's actually fetch the board games on `ComponentDidMount`:

```
componentDidMount() {
   fetch(API_URL)
     .then((response) => response.json())
     .then((games) => this.setState({games}))
 }
```

Our final component code should now look like this:

```
import * as React from 'react';
import { Link } from 'react-router-dom'

import GameList from './GameList';

const API_URL = 'https://bgg-json.azurewebsites.net/hot';

export default class Home extends React.Component {
 state = {
   games: []
 }

 componentDidMount() {
   fetch(API_URL, {mode: 'no-cors'})
     .then((response) => response.json())
     .then((games) => this.setState({games}))
 }

 render() {
   return (
     <div>
       <h1>Board game loader</h1>
       <GameList games={this.state.games} />
       <Link to="/settings">settings</Link>
     </div>
   );
 }
}
```

We should see a big list of Board Games now, but there are some enhancements we can make. For example, we aren’t handling our loading or error states. It’s also a little unfortunate they we have to break out of our component model. In general at Shopify, we embrace the component model even for imperical tasks like fetching data. 

#### Step 10: Using the Fetch component

Let’s clean up our fetch code from the previous step by adding the `react-fetch-component` and refactoring our render function.

```bash
npm add @shopify/react-fetch-component
```

Import the Fetch component from this package.

```js
import Fetch from 'react-fetch-component';
```

And now we can encapsulate all of our the imperitive logic in this component as well as check for errors and loading. This is done inside of a `renderProp`, a pattern whereby we pass a function into the of child of our component. This funciton is passed a single object with a boolean `loading` property that we can use to  check if the request is in process, an `error` property that is undefined unless there is an error in our request and finally the resulting data from our request.

We are going to destructure those and handle each property within our render function.

```js
  <Fetch url={API_URL} as="json">
   {({loading, error, data}) => {
      if (loading) {
        return <p>loading</p>;
      }
      if (error) {
        return <p>failed to fetch games</p>;
      }

      return <GameList games={data} />;
    }}
  </Fetch>
```

With this change we can go back to a Stateless React Component and our entire Home component should look like this:

```js
import * as React from 'react';
import {Link} from 'react-router-dom';
import Fetch from 'react-fetch-component';

import GameList from './GameList';

const API_URL = 'https://bgg-json.azurewebsites.net/hot';

export default function Home() {
  return (
    <div>
      <h1>Board game loader</h1>
      <Fetch url={API_URL} as="json">
        {({loading, error, data}) => {
          if (loading) {
            return <p>loading</p>;
          }
          if (error) {
            return <p>failed to fetch games</p>;
          }

          return <GameList games={data} />;
        }}
      </Fetch>
      <Link to="/settings">settings</Link>
    </div>
  );
}
```

#### Step 11: Fetching Products with GraphQL (Matt)
GraphQL is a query language and runtime that sits between the front-end client and backend data services. The GraphQL query language provides a common query syntax for data fetching and manipulations, while the GraphQL runtime is sent those queries, typically via http at a URL on a web service, to then validate, execute and finishes by provide a JSON response.

The first thing we need to do is install Apollo. Apollo is a community that builds a number of tools for developers to work with GraphQL on both the server and the client. We are going to use their JavaScript client for React in order to work with our GraphQL API on the frontend. GraphQL clients exist to abstract the common tasks that are agnostic to your specific app, such as sending queries and mutations, low-level networking details and maintaining a local cache. Apollo is one such client that we currently use in Shopify/web, but there are others such as Facebook's Relay and Lokka.

Let's install the `react-apollo` library as well as `apollo-boost`, which is newer library that apollo released to help developers quickly get started with zero-config.

```bash
npm add apollo-boost react-apollo@beta
```

We also have a custome middleware that we are going to add in order to proxy of graphql requests from our embedded shopify app.

```bash
npm add @shopify/koa-shopify-graphql-proxy
```

Lets begin by importing and adding the `koa-shopify-graphql-proxy` to our middleware chain, just before server rendered react app middleware.

```js
import graphQLProxy from '@shopify/koa-shopify-graphql-proxy';

//... later on
app.use(graphQLProxy);
```

Now on the client side, lets configure our apollo client, we are going to this at the top-level of our application in app/App.js.

```js
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
 ssrMode: isServer,
 uri: '/graphql',
 fetchOptions: {
   credentials: 'include',
 },
});
```

This is very basic configuration for Apollo, we are telling it that we are a server-rendered app, where to make the graphql requests and some additional options that are passed to the requests. We now need to wrap our App in the ApolloProvider, passing it our new client. This gives components further down in our tree access to the ApolloClient.

```diff
export default function() {
  return (
+   <ApolloProvider client={client}>
      <React.Fragment>
        <Propagator />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
+   </ApolloProvider>
  );
}
```

Now with our Apollo client configured, we can start query for the products in our store using the GraphqlAPI. Apollo boost exports a template literal tag that parses GraphQL queries called `gql`. Let's create a new files in our `app` directory called `queries` add our products query there.

```js
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
```

Next we can use this query document in our `Home` component by passing it into the `Query` component from `react-apollo`. The Query component receives this query (in the `query` prop) and will subscribe to its result from the Apollo Client cache. When we request the products from the server, they are going to update in our Apollo cache and those updates will be picked up by this component causing it to re-render with the updated data.

How this component renders is expressed using the same renderProp pattern we saw in our `Fetch` component, and it is also passed a single object with similar `loading`, `error` and `data` properties. The ends up making the child of our `Query` function look pretty similar to that of our `Fetch` component.



```js
import {Query} from 'react-apollo';
import {GET_GAMES} from './queries';
//...
<Query query={GET_GAMES}>
  {({loading, error, data}) => {
    if (loading) {
      return <p>loading</p>;
    }

    if (error) {
      return <p>failed to fetch products</p>;
    }

    if (data) {
      console.log(data);
      const products = data.shop.products.edges.map(({node}) => node);

      return <ProductList products={products} />;
    }
  }}
</Query>
```

#### Step 12: Creating Products with GraphQL (Matt)
Adding a mutation operation is very similar to a query, but with some important differences. First, in `app/queries` lets add our mutation query:

```js
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
```

We are going to use this mutation in the `GameItem` component, so over in `app/GameItem.js` lets import our query. 

```js
import {CREATE_PRODUCT} from './queries';
```

Just like we used the Query compoent from `react-apollo` for our query, we are going to use the Mutation component for our mutation. Lets import that as well.

```js
import {Mutation} from './react-apollo';
```

And instead of a `query` prop, this component accepts a `mutation` prop and we pass our `gql` wrapped query document into that prop. Lets start by adding this component to our render and return the same markup from our render prop.

```js

export default function GameItem({game: {name}}) {
  return (
    <Mutation mutation={CREATE_PRODUCT}>
      {() => {
        return (
          <li>
            <p>{name}</p>
            <button>Create product</button>
          </li>
        );
      }}
    </Mutation>
  );
}
```

Now let's fill in our render function. The first argument to our render prop is the mutate function that we call to tell Apollo Client that we'd like to trigger a mutation, let's call it `createProduct`. The second argument is an object, similar to our other render props so far in this workshop. It has a `data` property that will contain the result from our mutation as well as the same `error` and `loading` properties.

We want to call our mutation when our button is clicked, so we are going to add an `onClick` function that calls our mutation function and passes it the variables it expects.

```js

export default function GameItem({game: {name}}) {
  return (
    <Mutation mutation={CREATE_PRODUCT}>
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
```

We can also use the `loading`, `data` and `error` properties to show some use feedback.

If we return to the browser and click the Create product button, our product list isn’t updating, but if you refresh the page it should. This is because the products query in the Apollo cache does not know about our newly created product and it is only receiving our new product when it re-requests the query again on the page reload. Let’s fix that a second prop called `refetchQueries` to our `Mutation` component.

```diff
-    <Mutation mutation={CREATE_PRODUCT}>
+    <Mutation mutation={CREATE_PRODUCT} refetchQueries={[{query: GET_GAMES}]}>
```

This tells the Apollo client to refetch our `GET_GAMES` query after this mutation.

### Closing thoughts
We covered a lot of different topics in this workshop, but hopefully this has given you a headstart on building web-apps using Shopify’s tools for the Node and React.

#### Additional Resources













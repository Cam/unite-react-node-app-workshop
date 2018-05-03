# Unite 2018 - React/Node App Workshop

In this repo you'll find everything you need to follow along with the workshop.

## Before starting

The following steps should be done before you start the workshop

### Install Node (and npm)

Install the latest LTS version of node from [the official site](https://nodejs.org/en/download/). This will include the npm client we'll use to install dependencies.

### Install git

We'll be using git heavily in this workshop, and you'll especially need it if you fall behind.

### Expose your dev environment to the internet

Download ngrok
https://ngrok.com/download

Open a tunnel

```bash
$ ngrok http 3000
```
Matt: Maybe add note about path to ngrok.

Matt: Maybe add note about path to ngrok.

### Set up an App on the partners dashboard

Create your app on the **Apps** page of the [partner dashboard](https://partners.shopify.com/organizations).

Rename `.env.example` to `.env` and copy and paste your Shopify Api Key and Secret to this file.

```
SHOPIFY_API_KEY=YOUR_SHOPIFY_API_KEY
SHOPIFY_SECRET=YOUR_SHOPIFY_SECRET
```

## Starting the app

Install the dependencies by running in the project root:
`npm install`

And finally run the app:
`npm start`

Open a browser and go to either [localhost:3000](localhost:3000) or the url provided by ngrok. You should see a the following in your browser.

(Add image of app in browser)

## Using this repo

The starting stage of each step of the workshop is represented by a branch in this repo. If you fall behind or accidently get into a broken state, you can always checkout the appropriate branch.

For example, if you are still on step1 and the workshop has moved on to step2, you can run:

```
git stash
git checkout step2
```

## Whats included

We have pre-configured a number of tools to get started quickly. You do not need to have a deep understanding of them for this workshop, however feel free to learn more about them in the following links.

* [babel]() lets us use modern syntax and JSX everywhere\
* [webpack]() compiles our client-side code into a bundle
* [prettier]() make our code look pretty and maintains consistency
* [dotenv]() helps configure our environment variables
* [koa]() minimalistic and modern node server framework

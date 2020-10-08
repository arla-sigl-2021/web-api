# Web API workshop

This workshop is targeted for students of EPITA SIGL 2021.

You will learn how to create a Web API using `NodeJS` and `TypeScript`.

This template API will expose the following routes:
- get help requests page
- post new help request

## Step 1: Setup your environment

You should already have `NodeJS` installed via `nvm` from former workshop.

> If it's not the case, please refer to the previous workshop to install necessary tools.

You need to clone this `template` folder to a new `api` folder on your group's project.

Once this is done, you can verify if API is working on your localhost:
```sh
# use correct version of node
$ nvm use
# install node modules
$ npm i
# start the web api on your local host
$ npm start
# Server should listen on http://localhost:3000
```

Make sure you get the `help requests` by running:
```
# This should return 10 first help requests
$ curl http://localhost:3000/v1/help-request/other?page=1&limit=10
```

## Step 2: Understand the API code

## Step 3: Deploy your API

## Step 4: Create a new service

You will create a new service to get all user's help requests.

To do so:
- create a new service named: `handleUserHelpRequests` using same page system as for the `handleOtherHelpRequests` route
- use user's help requests fake database from `src/db.ts` file
- expose the `service` thru the route `/v1/help-request/user`
- Test your API locally: 
```
curl http://localhost:3000/v1/help-request/user?page=1&limit=10
# You should have documents with `user: "you"` instead of `user: "Someone else"`
```

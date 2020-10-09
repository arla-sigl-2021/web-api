# Web API workshop

This workshop is targeted for students of EPITA SIGL 2021.

You will learn how to create a Web API using `NodeJS` and `TypeScript`.

This template API will expose a single route to get a page of help requests posted by users of Arlaide.

## Step 1: Setup your environment

You should already have `NodeJS` installed via `nvm` from former workshop.

> If it's not the case, please refer to the previous workshop to install necessary tools.

You need to clone this `template` folder to a new `api` folder on your group's project.

Once this is done, you can verify if API is working on your localhost:

```sh
# use correct version of `Node`
$ nvm use
# install `Node` modules
$ npm i
# start the web api on your local host
$ npm start
# Server should listen on http://localhost:3000
```

Make sure you get the `help requests` by running:

```
# This should return 10 first help requests.
$ curl http://localhost:3000/v1/help-request?page=1&limit=10
```

> Note: we don't have hot reload implemented. We decided that it was unecessary overhead code since this workshop
> is not requiring code changes. If you want to play around with the code, you'll have to stop and restart `npm start` command on each code changes.

## Step 2: Deploy your API

To add the API to your CD pipeline on Github Action, you need to:

- Dockerize the API
- Adapt your github workflow `yaml` file

### Dockerize the API

There is already a `Dockerfile` under the `api` directory you've just created.

> Note: You need a seperated container, since 1 docker container = 1 process. You can't have 1 dockerfile with
> both NGINX exposing your frontend and `Node` exposing your web API on a different port.

We use `Node` so you will use same `Node` image from the previous workshop `node:14-alpine`.

Then, there is only few steps:

- copy the code to the image:

```dockerfile
COPY . /code
WORKDIR /code
```

- install project dependencies

```dockerfile
RUN npm i
```

- add the command line to be run on `docker run`:

```dockerfile
# This will build and run the web api using Node (see. package.json's script section)
CMD npm start
```

- expose the port 3000 since default port expose is 80, we need to explicitly set it.

```dockerfile
EXPOSE 3000
```

> Not setting this options would make Traefik unable to proxy api requests, and you'll get a `404`!

Try out locally see if you can query the web API:

```sh
# from the root of your repository:

docker build -t arlaide-api:v1 api/
docker run -p 3000:3000 arlaide-api:v1
```

Then you should be able to query your API from your browser: [http://localhost:3000/v1/help-request?page=1&limit=10](http://localhost:3000/v1/help-request?page=1&limit=10)

### Adapt your github workflow

Just create a new workflow file under `.github/workflow` folder, named `api.yaml`

Which is exactly a copy of the current job, except the following changes:

- specify the `api` folder instead of `.` on building docker image (since Dockerfile is inside `api/` folder)
  `docker build -t docker.pkg.github.com/<YOUR_GITHUB>/<YOUR_PROJECT>/arlaid-api:${{ github.sha }} api/`
- `arlaid-api` instead of `arlaid` as image name (tag can still be `github.sha`)
- deployment changes with `arlaid-api` as `container_name` and labels need changes:
  - `traefik.frontend.rule=Host:api.${{ secrets.SSH_HOST }}` to expose your API to the domain `api.groupeXX.arla-sigl.fr`
  - `traefik.frontend.port=3000` to route request to port 3000 of your API container

We provided you the full file content; you just have to replace `<YOUR_GITHUB>/<YOUR_PROJECT>` by your group's context (e.g. `ffauchille/arla-group-11` for group 11):

```yaml
# This is a basic workflow to help you get started with Actions

name: API CD

# Controls when the action will run. Triggers the workflow on push or pull request
# events but only for the master branch
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build-and-deploy:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v2

      # Runs a single command using the runners shell
      - name: Build and publish docker image
        run: |
          docker build -t docker.pkg.github.com/<YOUR_GITHUB>/<YOUR_PROJECT>/arlaid-api:${{ github.sha }} api/
          docker login docker.pkg.github.com -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASSWORD }}
          docker push docker.pkg.github.com/<YOUR_GITHUB>/<YOUR_PROJECT>/arlaid-api:${{ github.sha }}
      # Runs a set of commands using the runners shell
      - name: Deploy on production VM
        uses: appleboy/ssh-action@master
        env:
          TAG: ${{ github.sha }}
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          envs: TAG
          script: |
            docker login docker.pkg.github.com -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASSWORD }}
            docker pull docker.pkg.github.com/<YOUR_GITHUB>/<YOUR_PROJECT>/arlaid-api:$TAG
            (docker stop arlaide-api && docker rm arlaide-api) || echo "Nothing to stop..."
            docker run -d --network web --name arlaide-api --label traefik.enable=true --label traefik.docker.network=web --label traefik.frontend.rule=Host:api.${{ secrets.SSH_HOST }} --label traefik.frontend.port=3000 docker.pkg.github.com/<YOUR_GITHUB>/<YOUR_PROJECT>/arlaid-api:$TAG
```

You can see the implementation for the group 11 [on this pull request's file](https://github.com/ffauchille/arla-group-11/blob/b88855fa2fe2e529a31566ad74ff220397ec0e89/.github/workflows/api.yml).

> Note 1: This is a lot of duplicated code, to avoid this, you could create your own github action;
> but it's a bit out of the scope of this workshop :)
> Docs how to create your own github action: https://docs.github.com/en/free-pro-team@latest/actions/creating-actions

> Note 2: You can also use [paths](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestpaths) workflow parameter to trigger API CD
> only when you have changes on the api/ folder

## Step 3: Understand the API code

The code has the following structure:

```sh
.
├── Dockerfile                  # Describe in step 3
├── package-lock.json           # lock `Node` dependencies
├── package.json                # describe which `Node` module this project uses
├── src
│   ├── db.ts                   # expose a fake database with fake help requests
│   ├── fake-data
│   │   └── help-requests.ts    # contains all fake help requests
│   ├── server.ts               # the route and service code of the web api
│   └── utils.ts                # utilities functions that can be reuse over serveral services
└── tsconfig.json               # configuration of the TypeScript compiler
```

### Web API core

This template is using [ExpressJS](https://expressjs.com) framework to help you build your web API in `Node`. It has the advantage to give you the bare minumum configuration to have an api running:

```ts
import express from "express";
// ...
const app = express();
const port = 3000;
// ...
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
```

Those few lines expose an web API with no servies. Not very useful.

We created an API for you, exposed with the route: `/v1/help-request` and with 2 mandatory query options: `page` and `limit`.

In order to expose a service answering to the verb `GET`, you need to use `app.get(...)` method. Then, you need to tell express what is to be done once someone requested this service, by respecting declaring a function that takes 2 parameters:
`request` and `response`. This is called a request handler.

Code is as follow:

```ts
app.get(
  "/v1/help-request",
  (request: express.Request, response: express.Response): void => {
    // Getting value of page and limit query options:
    // ex: http://<domain>/v1/help-request?page=1&limit=10
    //  page == 1
    //  limit == 10
    try {
      const { page, limit } = extractPageOptions(request);

      // Query the page of help requests from the fake database
      const helpRequests: HelpRequest[] = FakeDB.getHelpRequest(page, limit);

      // sends the response back to the client, when `Node` will be ready!
      response.send(helpRequests);
    } catch (e) {
      // Something went wrong internally to the API,
      // so we are returning a 500 HTTP status
      response.statusCode = 500;
      response.send({ error: e.message });
    }
  }
);
```

The `try ... catch` form is to make sure that we handle any error that could have happened during the execution of the service.
This is very important since consumer of this API will expect an answer no matter what. At least that it failed and why.

Start the api locally (see previous step) and try to call the route without the `?page=1&limit=10`: http://localhost:3000/v1/help-request

You see that it complains about `page` query option not being an integer, because it's not even there.

### Middlewares

`ExpressJS` comes with a notion of middleware. In this context, a Middleware will apply same function to each request of any services of the API.

This template uses 2 middleware:

- `cors` middleware, to implement mandatory Cross-Origin Ressource Sharing check from the browser. This middleware is necessary if your frontend is requesting an API on a different domain than the API domain.
  > Very nice article about CORS on MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- `body-parser` middleware, expose for use `query options` accessible via `request.query` and parse for us body to JSON format. This is useful when you will implement a POST request

### A note about FakeDB

For this workshop, we do not integrate with any databases. So we created a fake database formalized by a `namespace`.
`namespace`, among other things, is a way to implement [Singleton](https://en.wikipedia.org/wiki/Singleton_pattern) in TypeScript.

It is important to seperate your `service` code from your `database` code. It's easier to test and make it very easy to change storage in a later point of time. Like for us in next workshop about database.

### Step 4: Play around with data

Feel free to play around with fake data, modifying descriptions inside [template/src/fake-data/help-requests.ts](https://github.com/arla-sigl-2021/web-api/blob/master/template/src/fake-data/help-requests.ts) folder:
- restart the `npm start` command
- query again your data using paging: http://localhost:3000/v1/help-request?page=1&limit=20

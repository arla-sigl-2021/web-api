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

Here is the following str

## Step 3: Deploy your API

To add the API to your CD pipeline on Github Action, you need to:

- Dockerize the API
- Adapt your github workflow `yaml` file

### Dockerize the API

Create a new `Dockerfile` under the `api` directory you've just created.

> Note: You need a seperated container, since 1 docker container = 1 process. You can't have 1 dockerfile with
> both NGINX exposing your frontend and node exposing your web API on a different port.

We use `node` so you will use same node image from the previous workshop `node:14-alpine`.

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

Comming all together, your Dockerfile content should be:

```dockerfile
FROM node:14-alpine

COPY . /code
WORKDIR /code
RUN npm i
CMD npm start
```

Try out locally see if you can query the web API:

```sh
# from the root of your repository:

docker build -t arlaide-api:v1 ./api/Dockerfile
docker run -p 3000:3000 arlaide-api:v1
```

Then you should be able to query your API from your browser: [http://localhost:3000/v1/help-requests?page=1&limit=10](http://localhost:3000/v1/help-requests?page=1&limit=10)


### Adapt your github workflow

You need a new workflow job: `build-and-deploy-api`.

Which is exactly a copy of the current job, but with the api image:

```yaml
build-and-deploy-api:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v2

      # Runs a single command using the runners shell
      - name: Build and publish docker image
        run: | 
          docker build -t docker.pkg.github.com/<YOUR_GITHUB>/<YOUR_PROJECT>/arlaid-api:${{ github.sha }} .
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
            docker run -d --network web --name arlaide-api --label traefik.enable=true --label traefik.docker.network=web --label traefik.frontend.rule=Host:${{ secrets.SSH_HOST }} --label traefik.frontend.port=80 docker.pkg.github.com/<YOUR_GITHUB>/<YOUR_PROJECT>/arlaid-api:$TAG
```

Creating a new job will speed up deployment since `jobs` are running in parrallel as `jobs` are running sequentially (one after the other).

> This is a lot of duplicated code, to avoid this, you could create your own github action;
> but it's a bit out of the scope of this workshop :)
> Docs how to create your own github action: https://docs.github.com/en/free-pro-team@latest/actions/creating-actions

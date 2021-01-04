# Turbofil-xyz Backend Deployment

## Pre-requisite

* MongoDB v4.4.x Community Version
* NodeJS v14.x
* NPM

### Install MongoDB

For Ubuntu 18.04

```
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Install Nodejs

```
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Configuration

Configurations are in the file `./src/env.json`. In particular,

`port`: the port that the backend server runs.
`jobIntervalSeconds`: How frequent the backend end fetch data. Default: 1 hour.

## Build

```bash
npm i
npm run build
```

## Start

First, make sure mongodb is running by

```
sudo systemctl start mongod
```

Then start the backend.

```bash
node build/index.js
```
# Turbofil-xyz Backend

## Overview

This backend provides APIs for the Turbofil-xyz frontend, enables it to obtain Cluster, Trade and Block information efficiently. The backend caches the contents from multiple upstreams on a hourly basis to reduce latency and improve performance. Code is written in NodeJS and caching is done in MongoDB. All source code is stored in the `src` folder. It's structure is as follows.


* `src/getters/*`: These objects are responsible for 1) getting the contents from other servers and cache them into the MongoDB database; 2) provide functions to retrieve the cached content.
* `src/middlewares/*`: These objects are responsible for serving the APIs that this backend provides. The backend uses the framework `ExpressJs`.
* `src/env.json`: The configuration files. It mainly contains the urls of the servers that this backend fetch from.
* `src/env.schema.json`: The JSON-Schema for the configuration file. Enables auto-complete, type checking, etc.
* `src/Types.ts`: All the interface. Namespace `Getter` is used by all Getters, and namespace `Handlers` is used by all Middlewares.
* `src/index.ts`: The entry point of the backend. `index.ts` is run when the backend is started.

To read this project, start with `src/index.ts`. All source codes are properly commented. Belows are some additional notes.

## Getters

All `Getters` is inherited by `GetterAbstract` class in `src/getters/GetterAbstract.ts`, and all MongoDB collections is wrapped by a `CollectionAbstract` class in `src/getters/CollectionAbstract.ts`

Each `Getter` have one (and only one) corresponding `Middleware`.

## Middlewares

Each `Middlewares` handles a particular prefix of the request. For example, the `BfcChainHandler` handles all urls that starts with `/bfcChain/`.

## MongoDB Client

The backend connects to the MongoDB by `MongoClientShared` object in the `src/MongoClientShared.ts`.

## Logging

Logging is done by the `pino` and `pino-http` library. See `src/LoggerShared.ts` for details.
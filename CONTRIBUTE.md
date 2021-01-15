# Turbofil-xyz Backend

> This document is for the modification and contribution of the source codes. Read `README.md` first to know how to build and deploy the project.

## Overview

This backend provides APIs for the Turbofil-xyz frontend, enables it to obtain Cluster, Trade and Block information efficiently. The backend caches the contents from multiple upstream servers on an hourly basis to reduce latency and improve performance. Code is written in NodeJS and caching is done in MongoDB. All source code is stored in the `./src`. Its structure is as follows.


* `src/getters/*`: These objects are responsible for
  1. getting the contents from other servers and cache them into the MongoDB database
  2. provide functions to retrieve the cached content.

* `src/middlewares/*`: These objects are responsible for serving the APIs that this backend provides. The backend uses the framework `ExpressJs`.
  
* `src/env.json`: The configuration files. It mainly contains the urls of the servers that this backend fetch from.
  
* `src/Types.ts`: All the interface (type declarations). Namespace `Getter` is used by all Getters, and namespace `Handlers` is used by all Middlewares.
  
* `src/index.ts`: The entry point of the backend. `index.ts` is run when the backend is started.

To read this project, start with `src/index.ts`. All source codes are properly commented. Belows are some additional notes.

## APIs

All Apis that the server provides is stored in namespace `Handler` in `src/types.ts`. The corresponding url and methods are in the comments.

## Getters

All `Getters` is inherited by `GetterAbstract` class in `src/getters/GetterAbstract.ts`, and all MongoDB collections is wrapped by a `CollectionAbstract` class in `src/getters/CollectionAbstract.ts`

Each `Getter` have one (and only one) corresponding `Middleware`.

Each `Getter` writes and reads its corresponding MongoDB collections to cache data, with the exception that `BfcTradeGetter` reads from collections of `BfcDbGetter` and `BfcChainGetter` in the API `/getLineChartData`

## Middlewares (Handlers)

Each `Middlewares` handles a particular prefix of the request. For example, the `BfcChainHandler` handles all urls that starts with `/bfcChain/`.

## MongoDB Client

The backend connects to the MongoDB by `MongoClientShared` object in the `src/MongoClientShared.ts`.

## Logging

Logging is done by the `pino` and `pino-http` library. See `src/LoggerShared.ts` for details.
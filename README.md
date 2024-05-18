# Crystallize Bulk Edit Import App

> Import app that provides a UI for importing and mapping datasets to Crystallize.

## Requirements

You need:

-   Caddy Server
-   Node 20
-   PNPM 9.1.1

## Install

```bash
make install
```

## Run the project

HTTPS locally, if you want to simplify authentication you should run the project and inject the local url in Crystallize.
Make sure to update your `.env` file.

> Pro tip: Once the Cookie is created you can reach the https url directly.

First you need to start the services, Caddy server is the only service for now. This is non-blocking.

```bash
make start-services
```

Then you can run the webserver:

```bash
make serve
```

> https://bulk-edit-import.app.crystallize.app.local

Caddy can generate the HTTPS Certificates on its own if the domain is `.local` so you should be covered.
However, `bulk-edit-import.app.crystallize.app.local` must resolve to `127.0.0.1`

## Contributing

```make codeclean`

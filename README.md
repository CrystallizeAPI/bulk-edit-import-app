# Plantasjen Bulk Edit Import App

> Import app that provides a UI for importing and mapping datasets to Crystallize.

## Requirements

You need:

-   Caddy Server
-   Node 20
-   PNPM 9.6.0

## Install

```bash
make install
```

## Run the project

Make sure to update your `.env` file, otherwise authentication will fail.

HTTPS locally, if you want to simplify authentication you should run the project and inject the local url in Crystallize.

The repository is setup to serve an on the domain: `bulk-edit-import.app.crystallize.app.local` (in the Caddyfile)

Caddy can generate the HTTPS Certificates on its own if the domain is `.local` so you should be covered.
However, `bulk-edit-import.app.crystallize.app.local` must resolve to `127.0.0.1`, you can update your `/etc/hosts` or using any tool on your
computer to achieve that resolution.

Then, you first need to start the services, Caddy server is the only service for now. This is non-blocking.

```bash
make start-services
```

Then you can run the webserver (Node JS):

```bash
make serve
```

Then you can install the App in Crystallize, url: `https://bulk-edit-import.app.crystallize.app.local`

> Pro tip: Once the Cookie is created you can reach the https url directly.

## Contributing

In order to keep the project clean there are coding standards that you can comply with using:

```bash
make codeclean
```

There are few tests that you can also run

```bash
make tests
```

## Deploying

The repo comes with a `Dockerfile` and the configuration for Fly.io but any hosting provider could work.

An important note: this project does import/export which are tasks that are not the fatest and you need to be able to control timeouts on the hosting providers you select.

> i.e: you don't want the update to stop after 30 seconds.

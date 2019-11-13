# matall.in

[![Greenkeeper badge](https://badges.greenkeeper.io/matallo/matall.in.svg)](https://greenkeeper.io/)

This repo contains the source code for the personal website of [Carlos Matallín](https://matall.in/).

## Installation

- [Local](#local)
- [With Docker](#with-docker) (recommended)

### Local

The website is built on top of [Jekyll](http://jekyllrb.com/), a simple content management system for static sites.

The website uses [gulp](https://gulpjs.com/) tasks for development, and [webpack](https://webpack.js.org/) for module bundler.

#### Dependencies

In order to use Jekyll, you will need to have Ruby installed. There are several ways to [install Ruby](https://www.ruby-lang.org/en/documentation/installation/). You need to install [Bundler](http://bundler.io/) to install the dependencies. You'll need Node.js installed, and a package manager, such as [Yarn](https://yarnpkg.com/en/) or [npm](https://www.npmjs.com/).

- Ruby
- RubyGems
- Bundler
- Node.js
- Yarn

Once you have [Bundler](http://bundler.io/) and [Yarn](https://yarnpkg.com/en/) installed, use them to intall the dependencies:

```
bundle install
yarn global add gulp-cli # npm install gulp-cli -g to install with npm.
yarn # npm install to install with npm.
```

You should now have everything needed to run the website locally.

### With Docker

[Docker](https://www.docker.com/) provides a way to run applications in a container, with all its dependencies. [Compose](https://docs.docker.com/compose/) is a tool for running Docker applications.

You should have Docker and Compose properly installed on your machine.

Running the website on Docker is as simple as running `docker-compose up`. This downloads the Docker image, and builds the website.

## Usage

There are several tasks available to help you build and test the website. We'll run them in the Docker container, but the same tasks can be run locally.

### Run locally

```
docker-compose run --rm -e JEKYLL_ENV=development web yarn start
```

This will have Jekyll build the site, webpack compile the assets, run a static server to listen on port 9000 (which you can now reach at [http://localhost:9000/](http://localhost:9000/)), and watch for changes to site files. Every change will cause Jekyll to rebuild the affected files, webpack to compile the assets, and reload the page.

### Build

You can also build the website and browse through the dist files, launching a server in that folder:

```
docker-compose run --rm web
cd dist/
python -m SimpleHTTPServer
```

You can use environment variables to build the website for a different environment:

```
docker-compose run -e JEKYLL_ENV=staging -e NODE_ENV=production web yarn build
```

### Test

Tests can be launched with [Jest](https://facebook.github.io/jest/) running the following command in the terminal:

```
docker-compose run --rm web yarn test
```

Add `--coverage` option to show test coverage.

### Format

Before commiting files run [Prettier](https://prettier.io/) to format the code:

```
docker-compose run --rm web yarn format
```

### Lint

Finally, JS files can be checked with [ESLint](http://eslint.org/) to keep a consistent styleguide, running the following command in the terminal.

```
docker-compose run --rm web yarn lint
```

### Update dependencies

To update the dependencies for Bundler, and Yarn respectively you can run:

```
docker-compose run --rm web yarn upgrade
docker-compose run --rm web bundle update
```

### Deploy

When pushing (or merging) to the `master` branch in the repository, the website is automatically deployed to [https://matall.in/](https://matall.in/) via [CircleCI](https://circleci.com/gh/matallo/workflows/matall.in).

CircleCI uses a [config](.circleci/config.yml) workflow very similar to the [Dockerfile](Dockerfile). Ideally we would [build a CI/CD pipeline with Docker](https://circleci.com/blog/build-cicd-piplines-using-docker/), but we can use [CircleCI caching](https://circleci.com/docs/2.0/caching/) instead of [Docker Layer Caching](https://circleci.com/docs/2.0/docker-layer-caching/).

You can also launch a deploy to AWS S3 with the [AWS CLI](https://aws.amazon.com/cli/):

```
aws s3 sync --acl public-read dist/ s3://${AWS_BUCKET} --delete --exclude "*" --include "*.html" --include "*.txt" --include "*.xml" --cache-control "max-age=0, public"
aws s3 sync --acl public-read dist/ s3://${AWS_BUCKET} --delete --exclude "*" --include "*.ico" --include "*.png" --include "css/*" --include "js/*" --include "img/*" --cache-control "max-age=31536000, public" --expires $(date -d "+1 year" -u +%Y-%m-%dT%H:%M:%SZ)
```

## TODO

- [Bump scrollama to 2.0.0+](https://pudding.cool/process/scrollytelling-sticky/)
- [Serve ES2017 bundles to modern browsers](https://instagram-engineering.com/making-instagram-com-faster-code-size-and-execution-optimizations-part-4-57668be796a8)

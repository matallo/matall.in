# matall.in

This repo contains the source code for the personal website of [Carlos Matallín](https://matall.in/).


## Installation

The website is built on top of [Jekyll](http://jekyllrb.com/), a simple content management system for static sites.

The website uses [gulp](https://gulpjs.com/) tasks for development, and [webpack](https://webpack.js.org/) for module bundler.


### Dependencies

In order to use Jekyll, you will need to have Ruby installed. macOS comes pre-installed with Ruby, but you might need to install [Bundler](http://bundler.io/) to install the dependencies. You'll need Node.js installed, and a package manager, such as [Yarn](https://yarnpkg.com/en/) or [npm](https://www.npmjs.com/).

- Ruby
- RubyGems
- Bundler
- Node.js
- Yarn
- gulp.js
- Bower

Once you have [Bundler](http://bundler.io/) and [Yarn](https://yarnpkg.com/en/) installed, use them to intall the dependencies:

```
bundle install
yarn global add gulp-cli # npm install gulp-cli -g to install with npm.
yarn global add bower # npm install bower -g to install with npm.
yarn # npm install to install with npm.
bower install
```

You should now have everything needed to run the website locally.


## Usage

There are several tasks available to help you build and test the website.


### Run locally

```
yarn run start
```

This will have Jekyll build the site, webpack compile the assets, run a static server to listen on port 9000 (which you can now reach at [http://localhost:9000/](http://localhost:9000/)), and watch for changes to site files. Every change will cause Jekyll to rebuild the affected files, webpack to compile the assets, and reload the page.


### Build

You can also build the website and browse through the dist files, launching a server in that folder:

```
yarn run build
cd dist/
python -m SimpleHTTPServer
```


### Test

Tests can be launched with [Jest](https://facebook.github.io/jest/) running the following command in the terminal:

```
yarn run test
```


### Lint

Finally, JS files can be checked with [ESLint](http://eslint.org/) to keep a consistent styleguide, running the following command in the terminal.

```
yarn run lint
```


### Deploy

When pushing (or merging) to the `master` branch in the repository, the website is automatically deployed to [https://matall.in/](https://matall.in/) via [CircleCI](https://circleci.com/gh/matallo/workflows/matall.in).


You can also launch a deploy to AWS S3 with the [AWS CLI](https://aws.amazon.com/cli/):

```
aws s3 sync --acl public-read dist/ s3://$AWS_BUCKET --delete --exclude "*" --include "*.html"  --include "*.txt" --include "*.xml" --cache-control "max-age=0, public"
aws s3 sync --acl public-read dist/ s3://$AWS_BUCKET --delete --exclude "*" --include "*.ico" --include "*.png" --include "css/*" --include "js/*" --include "img/*" --cache-control "max-age=31536000, public" --expires $(date -d "+1 year" -u +%Y-%m-%dT%H:%M:%SZ)
```

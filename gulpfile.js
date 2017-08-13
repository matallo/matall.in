const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");
const browserSync = require("browser-sync").create();
const del = require("del");
const runSequence = require("run-sequence").use(gulp);
const childProcess = require("child_process");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig = require("./webpack.config.js");
const gutil = require("gulp-util");
const rev = require("gulp-rev");
const revReplace = require("gulp-rev-replace");
const awsPublish = require("gulp-awspublish");
const parallelize = require("concurrent-transform");

const plugins = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true; // eslint-disable-line no-unused-vars

const aws = {
  params: {
    "Bucket": process.env.AWS_BUCKET || "..."
  },
  accessKeyId: process.env.AWS_ACCESSKEYID || "...",
  secretAccessKey: process.env.AWS_SECRETACCESSKEY || "...",
  region: "us-west-2"
};

const publisher = awsPublish.create(aws);

gulp.task("rev-assets", () => {
  return gulp.src([
    "dist/css/{,*/}*.css{,.map}",
    "dist/js/{,*/}*.js{,.map}",
    "dist/img/**/*.{gif,jpeg,jpg,png,svg}"
  ], { base: "dist/" })
    .pipe(rev())
    .pipe(gulp.dest("dist/"))
    .pipe(rev.manifest())
    .pipe(gulp.dest("dist/"));
});

gulp.task("replace-assets", () => {
  const manifest = gulp.src("./dist/rev-manifest.json");

  const replaceJsAndCssIfMap = filename => {
    if (filename.indexOf(".map") > -1) {
      return filename.replace("js/", "").replace("css/", "");
    }

    return filename;
  };

  return gulp.src(["dist/**/*.{js,css,html,xml}"])
    .pipe(revReplace({
      manifest: manifest,
      replaceInExtensions: [".js", ".css", ".html", ".xml"],
      modifyUnreved: replaceJsAndCssIfMap,
      modifyReved: replaceJsAndCssIfMap
    }))
    .pipe(gulp.dest("dist/"));
});

gulp.task("deploy-dist", () => {
  const headers = {"Cache-Control": "max-age=0, public"};

  return gulp.src([
    "dist/**/*.{html,txt,xml}"
  ], { base: "dist/" })
    .pipe(parallelize(publisher.publish(headers), 5))
    .pipe(awsPublish.reporter());
});

gulp.task("deploy-assets", () => {
  const headers = {
    "Cache-Control": "max-age=31536000, public",
    "Expires": new Date(Date.now() + 31536000 * 1000)
  };

  return gulp.src([
    "dist/*.{ico,png}",
    "dist/css/{,*/}*.css{,.map}",
    "dist/js/{,*/}*.js{,.map}",
    "dist/img/**/*.{gif,jpeg,jpg,png,svg}"
  ], { base: "dist/" })
    .pipe(parallelize(publisher.publish(headers), 5))
    .pipe(awsPublish.reporter());
});

gulp.task("deploy-clean", () => {
  return gulp.src([
    "dist/**/*",
    "!dist/rev-manifest.json"
  ], { base: "dist/" })
    .pipe(publisher.publish())
    .pipe(publisher.cache())
    .pipe(publisher.sync())
    .pipe(awsPublish.reporter());
});

const lint = files => {
  return gulp.src(files)
    .pipe(plugins.eslint({ fix: true }))
    .pipe(reload({ stream: true, once: true }))
    .pipe(plugins.eslint.format())
    .pipe(plugins.if(!browserSync.active, plugins.eslint.failAfterError()));
};

gulp.task("lint", () => {
  return lint("app/_js/**/*.js")
    .pipe(gulp.dest("app/_js"));
});

gulp.task("lint:test", () => {
  return lint("__tests__/spec/**/*.js")
    .pipe(gulp.dest("__tests__/spec"));
});

gulp.task("lint:config", () => {
  return lint("*.js")
    .pipe(gulp.dest("./"));
});

gulp.task("html", () => {
  return gulp.src("dist/**/*.html")
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest("dist"));
});

gulp.task("clean", del.bind(null, [".tmp", "dist"]));

gulp.task("serve", () => {
  runSequence("clean", ["jekyll-serve"], () => {
    const myDevConfig = Object.create(webpackConfig);
    myDevConfig.entry["webpack-hot-middleware"] = ["webpack/hot/dev-server", "webpack-hot-middleware/client"];
    myDevConfig.plugins = myDevConfig.plugins.concat(
      new webpack.HotModuleReplacementPlugin()
    );
    myDevConfig.plugins = myDevConfig.plugins.concat(
      new webpack.SourceMapDevToolPlugin({
        filename: "[file].map",
        exclude: [
          "js/html5shiv.js",
          "js/vendor.js",
          "js/webpack-hot-middleware.js"
        ]
      })
    );

    const devCompiler = webpack(myDevConfig);

    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: [".tmp", "dist"]
      },
      middleware: [
        webpackDevMiddleware(devCompiler, {
          publicPath: webpackConfig.output.publicPath,
          stats: { colors: true }
        }),
        webpackHotMiddleware(devCompiler)
      ],
      reloadDebounce: 2000
    });

    gulp.watch([
      "app/**/*.html",
      "app/img/**/*",
    ], ["jekyll-serve"]);

    gulp.watch([
      "app/_scss/**/*.scss",
      "app/_js/**/*.js",
      "dist/**/*.html",
      "dist/img/**/*",
    ]).on("change", reload);
  });
});

gulp.task("serve:dist", ["default"], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ["dist"]
    }
  });
});

gulp.task("jekyll-serve", done => {
  return childProcess.spawn("bundle", ["exec", "jekyll", "build", "--incremental"], { stdio: "inherit" })
    .on("close", () => {
      done();
    })
    .on('error', function (err) {
      gutil.log(err);
    });
});

gulp.task("jekyll-build", done => {
  return childProcess.spawn("bundle", ["exec", "jekyll", "build", "--config", "_config.yml,_config-prod.yml"], { stdio: "inherit" })
    .on("close", () => {
      done();
    })
    .on('error', function (err) {
      gutil.log(err);
    });
});

gulp.task("webpack-build", done => {
  const myConfig = Object.create(webpackConfig);
  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: "[file].map",
      exclude: [
        "js/html5shiv.js",
        "js/vendor.js"
      ]
    })
  );

  webpack(myConfig, (err, stats) => {
    if(err) throw new gutil.PluginError("webpack-build", err);
    gutil.log("[webpack-build]", stats.toString({
      colors: true
    }));

    done();
  });
});

gulp.task("build", done => {
  runSequence("clean", ["jekyll-build", "webpack-build"], "html", "rev-assets", "replace-assets", done);
});

gulp.task("deploy", done => {
  runSequence("build", ["deploy-dist", "deploy-assets"], "deploy-clean", done);
});

gulp.task("default", () => {
  return new Promise(resolve => {
    dev = false;

    runSequence("build", resolve);
  });
});

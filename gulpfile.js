const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence').use(gulp);
const childProcess = require('child_process');
const merge = require('webpack-merge');
const webpack = require('webpack');
const browserSync = require('browser-sync').create();
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const { reload } = browserSync;
const download = require('gulp-download');
const PluginError = require('plugin-error');
const log = require('fancy-log');
const critical = require('critical').stream;
const gulpLoadPlugins = require('gulp-load-plugins');

const plugins = gulpLoadPlugins();
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');

const webpackConfig = require('./webpack.config.js');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

gulp.task('rev-assets', () =>
  gulp
    .src(['dist/css/{,*/}*.css{,.map}', 'dist/js/{,*/}*.js{,.map}'], { base: 'dist/' })
    .pipe(gulp.dest('dist/'))
    .pipe(rev())
    .pipe(gulp.dest('dist/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/')),
);

gulp.task('replace-assets', () => {
  const replaceJsAndCssIfMap = filename => {
    if (filename.indexOf('.map') > -1) {
      return filename.replace('js/', '').replace('css/', '');
    }

    return filename;
  };

  return gulp
    .src(['dist/**/*.{js,css,html}'])
    .pipe(
      revReplace({
        manifest: gulp.src('./dist/rev-manifest.json'),
        replaceInExtensions: ['.js', '.css', '.html'],
        modifyUnreved: replaceJsAndCssIfMap,
        modifyReved: replaceJsAndCssIfMap,
      }),
    )
    .pipe(gulp.dest('dist/'));
});

gulp.task('critical', () =>
  gulp
    .src(['dist/**/index.html', '!dist/flights/index.html'])
    .pipe(critical({ base: 'dist/', inline: true }))
    .on('error', err => {
      log(err.message);
    })
    .pipe(gulp.dest('dist/')),
);

gulp.task('html', () =>
  gulp
    .src('dist/**/*.html')
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: { compress: { drop_console: true } },
          processConditionalComments: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
        }),
      ),
    )
    .pipe(gulp.dest('dist/')),
);

gulp.task('imagemin', () =>
  gulp
    .src('dist/img/**/*.{gif,jpeg,jpg,png,svg}')
    .pipe(
      plugins.cache(
        plugins.imagemin([
          imageminJpegtran({ progressive: true }),
          imageminPngquant({ quality: '65-80' }),
        ]),
      ),
    )
    .pipe(gulp.dest('dist/')),
);

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('download', () =>
  download([
    'https://platform.twitter.com/widgets.js',
    'https://production-assets.codepen.io/assets/embed/ei.js',
    'https://www.google-analytics.com/analytics.js',
  ]).pipe(gulp.dest('app/_js/vendor/')),
);

gulp.task('serve', () => {
  runSequence('clean', 'jekyll-serve', () => {
    const myDevConfig = merge(webpackConfig, {
      entry: {
        'webpack-hot-middleware': ['webpack/hot/dev-server', 'webpack-hot-middleware/client'],
      },
      mode: 'development',
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.SourceMapDevToolPlugin({
          filename: '[file].map',
          exclude: ['js/html5shiv.js', 'js/vendor.js', 'js/webpack-hot-middleware.js'],
        }),
      ],
    });
    const devCompiler = webpack(myDevConfig);

    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'dist'],
      },
      middleware: [
        webpackDevMiddleware(devCompiler, {
          publicPath: webpackConfig.output.publicPath,
          stats: { colors: true },
        }),
        webpackHotMiddleware(devCompiler),
      ],
      reloadDebounce: 1000,
    });

    gulp.watch(['app/**/*.html', 'app/img/**/*'], ['jekyll-serve']);

    gulp
      .watch(['app/_scss/**/*.scss', 'app/_js/**/*.js', 'dist/**/*.html', 'dist/img/**/*'])
      .on('change', reload);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist'],
    },
  });
});

gulp.task('jekyll-serve', done =>
  childProcess
    .spawn('bundle', ['exec', 'jekyll', 'build', '--incremental'], { stdio: 'inherit' })
    .on('close', () => {
      done();
    })
    .on('error', err => {
      log(err);
    }),
);

gulp.task('jekyll-build', done =>
  childProcess
    .spawn('bundle', ['exec', 'jekyll', 'build', '--config', '_config.yml,_config-prod.yml'], {
      stdio: 'inherit',
    })
    .on('close', () => {
      done();
    })
    .on('error', err => {
      log(err);
    }),
);

gulp.task('webpack-build', done => {
  const myConfig = merge(webpackConfig, {
    mode: 'production',
    entry: {
      vendor: [
        './app/_js/vendor/widgets.js',
        './app/_js/vendor/ei.js',
        './app/_js/vendor/analytics.js',
      ],
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          sourceMap: true,
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
              annotation: true,
            },
          },
        }),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
      new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        exclude: ['js/html5shiv.js', 'js/polyfills.js', 'js/vendor.js'],
      }),
    ],
  });

  webpack(myConfig, (err, stats) => {
    if (err) throw new PluginError('webpack-build', err);
    log(
      '[webpack-build]',
      stats.toString({
        colors: true,
      }),
    );

    done();
  });
});

gulp.task('build', done => {
  runSequence(
    'clean',
    'download',
    ['jekyll-build', 'webpack-build'],
    'critical',
    'html',
    'imagemin',
    'rev-assets',
    'replace-assets',
    done,
  );
});

gulp.task(
  'default',
  () =>
    new Promise(resolve => {
      runSequence('build', resolve);
    }),
);

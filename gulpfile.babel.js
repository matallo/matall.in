import childProcess from 'child_process';
import del from 'del';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import log from 'fancy-log';
import merge from 'webpack-merge';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import PluginError from 'plugin-error';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from './webpack.config';

const { src, dest, watch, series, lastRun } = require('gulp');

const critical = require('critical').stream;

const $ = gulpLoadPlugins();
const server = require('browser-sync').create();

const clean = () => del(['.tmp', 'dist']);

gulp.task('download', done => {
  $.download([
    'https://platform.twitter.com/widgets.js',
    'https://production-assets.codepen.io/assets/embed/ei.js',
    'https://www.google-analytics.com/analytics.js',
  ]).pipe(dest('app/_js/vendor/'));

  done();
});

gulp.task('jekyll-build', done =>
  childProcess
    .spawn(
      'bundle',
      ['exec', 'jekyll', 'build', '--config', '_config.yml,_config-prod.yml'],
      {
        stdio: 'inherit',
      },
    )
    .on('close', () => {
      done();
    })
    .on('error', err => {
      throw new PluginError('jekyll-build', err);
    }),
);

gulp.task('webpack-build', done => {
  const myConfig = merge(webpackConfig, {
    mode: 'production',
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          exclude: ['js/html5shiv.js', 'js/polyfills.js'],
          parallel: true,
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
        exclude: ['js/html5shiv.js', 'js/polyfills.js'],
      }),
    ],
  });

  webpack(myConfig, (err, stats) => {
    if (err) throw new PluginError('webpack-build', err);
    log(
      'webpack-build',
      stats.toString({
        colors: true,
      }),
    );

    done();
  });
});

const scripts = () =>
  src('app/_js/vendor/*.js')
    .pipe($.concat('vendor.js'))
    .on('error', err => {
      throw new PluginError('scripts', err);
    })
    .pipe(dest('dist/js'));

const uglify = () =>
  src(['dist/js/{html5shiv,polyfills}.js'])
    .pipe($.uglify())
    .on('error', err => {
      throw new PluginError('uglify', err);
    })
    .pipe(gulp.dest('dist/js'));

const inlineCriticalCss = () =>
  src(['dist/**/index.html', '!dist/flights/index.html'])
    .pipe(critical({ base: 'dist', inline: true }))
    .on('error', err => {
      throw new PluginError('critical', err);
    })
    .pipe(dest('dist'));

const html = () =>
  src('dist/**/*.html')
    .pipe(
      $.if(
        /\.html$/,
        $.htmlmin({
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
    .pipe(dest('dist'));

const images = () =>
  src('dist/img/**/*.{gif,jpeg,jpg,png,svg}', { since: lastRun(images) })
    .pipe(
      $.imagemin([
        $.imagemin.jpegtran({ progressive: true }),
        $.imagemin.optipng({ optimizationLevel: 5 }),
      ]),
    )
    .pipe(dest('dist/img/'));

const revAssets = () =>
  src(['dist/css/{,*/}*.css{,.map}', 'dist/js/{,*/}*.js{,.map}'], {
    base: 'dist',
  })
    .pipe(dest('dist'))
    .pipe(rev())
    .pipe(dest('dist'))
    .pipe(rev.manifest())
    .pipe(dest('dist'));

const replaceAssets = () => {
  const replaceJsAndCssIfMap = filename => {
    if (filename.indexOf('.map') > -1) {
      return filename.replace('js/', '').replace('css/', '');
    }

    return filename;
  };

  return src(['dist/**/*.{js,css,html}'])
    .pipe(
      revReplace({
        manifest: src('dist/rev-manifest.json'),
        replaceInExtensions: ['.js', '.css', '.html'],
        modifyUnreved: replaceJsAndCssIfMap,
        modifyReved: replaceJsAndCssIfMap,
      }),
    )
    .pipe(dest('dist'));
};

const jekyllServe = done => {
  childProcess
    .spawn('bundle', ['exec', 'jekyll', 'build', '--incremental'], {
      stdio: 'inherit',
    })
    .on('close', () => {
      done();
    })
    .on('error', err => {
      throw new PluginError('jekyllServe', err);
    });
};

gulp.task('webpack-serve', () => {
  const myDevConfig = merge(webpackConfig, {
    entry: {
      'webpack-hot-middleware': [
        'webpack/hot/dev-server',
        'webpack-hot-middleware/client',
      ],
    },
    mode: 'development',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        exclude: [
          'js/html5shiv.js',
          'js/vendor.js',
          'js/webpack-hot-middleware.js',
        ],
      }),
    ],
  });

  const devCompiler = webpack(myDevConfig);

  server.init({
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

  watch(['app/**/*.html', 'app/img/**/*']).on('change', series(jekyllServe));
  watch([
    'app/_scss/**/*.scss',
    'app/_js/**/*.js',
    'dist/**/*.html',
    'dist/img/**/*',
  ]).on('change', server.reload);
});

const serve = series(clean, jekyllServe, 'webpack-serve');
const build = series(
  clean,
  'download',
  ['jekyll-build', 'webpack-build'],
  scripts,
  uglify,
  inlineCriticalCss,
  html,
  images,
  revAssets,
  replaceAssets,
);

gulp.task('serve', serve);
gulp.task('build', build);
gulp.task('default', build);

gulp.task(
  'serve:dist',
  series('default', () =>
    server.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['dist'],
      },
    }),
  ),
);

'use strict'

module.exports = function (grunt) {
  require('time-grunt')(grunt)
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin'
  })

  var config = {
    app: 'app',
    tmp: '.tmp',
    dist: 'dist',
    aws: {
      accessKeyId: process.env.AWS_ACCESSKEYID,
      secretAccessKey: process.env.AWS_SECRETACCESSKEY,
      bucket: process.env.AWS_BUCKET
    }
  }

  var mozjpeg = require('imagemin-mozjpeg')

  grunt.initConfig({
    config: config,

    // put your credentials and save
    // config.env.example to config.env
    aws_s3: {
      options: {
        accessKeyId: '<%= config.aws.accessKeyId %>',
        secretAccessKey: '<%= config.aws.secretAccessKey %>',
        bucket: '<%= config.aws.bucket %>',
        region: 'us-west-2',
        uploadConcurrency: 5,
        differential: true
      },
      clean: {
        options: {
          // Doesn't actually delete but shows log
          debug: true
        },
        files: [
          { cwd: '<%= config.dist %>/', dest: '/', exclude: 'flights/**/*', action: 'delete' }
        ]
      },
      dist: {
        options: {
          params: {
            'CacheControl': 'max-age=0, public'
          },
          gzipRename: 'ext'
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/',
          src: [
            '**/*.{html,xml}.gz'
          ],
          dest: '/'
        }]
      },
      assets: {
        options: {
          params: {
            'CacheControl': 'max-age=31536000, public',
            'Expires': new Date(Date.now() + 31536000 * 1000)
          },
          gzipRename: 'ext'
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/',
          src: [
            '*.{ico,png}',
            'css/{,*/}*.gz',
            'js/{,*/}*.gz',
            'img/**/*.{gif,jpeg,jpg,png,svg}',
            'fonts/{,*/}*.{eot,woff,woff2,ttf,svg}'
          ],
          dest: '/'
        }]
      }
    },

    watch: {
      browserify: {
        files: [
          '<%= config.app %>/_js/{,*/}*.js',
          '!<%= config.app %>/_js/{data,vendor}/*'
        ],
        tasks: ['browserify:dist']
      },
      js: {
        files: ['<%= config.app %>/_js/{data,vendor}/*'],
        tasks: ['copy']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      html: {
        files: [
          '<%= config.app %>/**/*.{html,md}',
          '<%= config.app %>/img/**/*.{gif,jpeg,jpg,png,svg}',
          '<%= config.app %>/fonts/{,*/}*.{eot,woff,woff2,ttf,svg}'
        ],
        tasks: ['shell:development', 'concurrent:server', 'postcss']
      },
      sass: {
        files: ['<%= config.app %>/_scss/{,*/}*.scss'],
        tasks: ['sass:server', 'postcss']
      }
    },

    shell: {
      development: {
        command: 'bundle exec jekyll build --incremental'
      },
      production: {
        command: 'bundle exec jekyll build --config _config.yml,_config-prod.yml'
      },
      htmlproof: {
        command: 'bundle exec htmlproofer ./dist --only-4xx --empty-alt-ignore',
        options: {
          execOptions: {
            maxBuffer: Infinity
          }
        }
      }
    },

    browserSync: {
      options: {
        notify: false,
        background: true
      },
      livereload: {
        options: {
          files: [
            '<%= config.app %>/{,*/}*.html',
            '.tmp/css/{,*/}*.css',
            '<%= config.app %>/img/{,*/}*',
            '.tmp/js/{,*/}*.js'
          ],
          port: 9000,
          server: {
            baseDir: [config.tmp, config.dist],
            routes: {
              '/bower_components': './bower_components'
            }
          }
        }
      },
      dist: {
        options: {
          background: false,
          server: '<%= config.dist %>'
        }
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      }
    },

    eslint: {
      target: [
        'Gruntfile.js',
        '<%= config.app %>/js/{,*/}*.js',
        '!<%= config.app %>/js/vendor/*'
      ]
    },

    browserify: {
      dist: {
        options: {
          transform: [
            ['babelify', { 'presets': ['es2015'] }]
          ],
          browserifyOptions: { debug: true }
        },

        files: [{
          expand: true,
          cwd: '<%= config.app %>/_js',
          src: [
            '{,*/}*.js',
            '!{data,vendor}/*'
          ],
          dest: '<%= config.tmp %>/js',
          ext: '.js'
        }]
      }
    },

    sass: {
      options: {
        sourceMap: true,
        sourceMapEmbed: true,
        sourceMapContents: true,
        includePaths: ['.']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/_scss/',
          src: ['*.scss'],
          dest: '<%= config.tmp %>/css',
          ext: '.css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/_scss/',
          src: ['*.scss'],
          dest: '<%= config.tmp %>/css',
          ext: '.css'
        }]
      }
    },

    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer-core')({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
          })
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.tmp %>/css/',
          src: '{,*/}*.css',
          dest: '<%= config.tmp %>/css/'
        }]
      }
    },

    filerev: {
      dist: {
        src: [
          '<%= config.dist %>/js/{,*/}*.*',
          '<%= config.dist %>/css/{,*/}*.css',
          '<%= config.dist %>/img/**/*.*',
          '<%= config.dist %>/fonts/{,*/}*.*'
        ]
      }
    },

    useminPrepare: {
      options: {
        dest: '<%= config.dist %>'
      },
      html: '<%= config.dist %>/index.html'
    },

    usemin: {
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/img',
          '<%= config.dist %>/css',
          '<%= config.dist %>/js'
        ],
        patterns: {
          js: [
            [/(js\/data\/.*?\.(?:json))/gm, 'Update the js to reference revved json']
          ],
          html: [
            [/(img\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the html to reference revved images'],
            [/(css\/.*?\.css)/gm, 'Update the html to reference revved stylesheets'],
            [/(js\/.*?\.js)/gm, 'Update the html to reference revved scripts']
          ]
        }
      },
      html: [
        '<%= config.dist %>/**/*.html',
        '<%= config.dist %>/feed.xml'
      ],
      css: ['<%= config.dist %>/css/{,*/}*.css'],
      js: ['<%= config.dist %>/js/{,*/}*.js']
    },

    imagemin: {
      dist: {
        options: {
          use: [mozjpeg()]
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>/img',
          src: '**/*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/img'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/img',
          src: '**/*.svg',
          dest: '<%= config.dist %>/img'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true,
          removeRedundantAttributes: false,
          useShortDoctype: true,
          minifyJS: true,
          minifyCSS: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '**/*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/_js/vendor',
          src: '*.js',
          dest: '<%= config.tmp %>/js/vendor'
        }, {
          expand: true,
          cwd: '<%= config.app %>/_js/data',
          src: '*.json',
          dest: '<%= config.dist %>/js/data'
        }]
      }
    },

    concurrent: {
      server: [
        'browserify',
        'copy',
        'sass:server'
      ],
      dist: [
        'browserify',
        'copy',
        'sass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    compress: {
      dist: {
        options: {
          mode: 'gzip',
          level: 9
        },
        files: [{
          expand: true,
          src: ['<%= config.dist %>/css/*.css'],
          ext: '.css.gz',
          extDot: 'last'
        }, {
          expand: true,
          src: ['<%= config.dist %>/js/{,*/}*.js'],
          ext: '.js.gz',
          extDot: 'last'
        }, {
          expand: true,
          src: ['<%= config.dist %>/js/{,*/}*.json'],
          ext: '.json.gz',
          extDot: 'last'
        }, {
          expand: true,
          src: ['<%= config.dist %>/**/*.html'],
          ext: '.html.gz',
          extDot: 'last'
        }, {
          expand: true,
          src: ['<%= config.dist %>/**/*.xml'],
          ext: '.xml.gz',
          extDot: 'last'
        }]
      }
    }
  })

  grunt.registerTask('serve', 'start the server and preview your app', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'browserSync:dist'])
    }

    grunt.task.run([
      'clean',
      'shell:development',
      'concurrent:server',
      'postcss',
      'browserSync:livereload',
      'watch'
    ])
  })

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.')
    grunt.task.run([target ? ('serve:' + target) : 'serve'])
  })

  grunt.registerTask('build', [
    'clean',
    'shell:production',
    'useminPrepare',
    'concurrent:dist',
    'postcss',
    'concat',
    'cssmin',
    'uglify',
    'filerev',
    'usemin'
  ])

  grunt.registerTask('htmlproof', [
    'shell:htmlproof'
  ])

  grunt.registerTask('deploy', [
    'htmlmin',
    'compress',
    // 'aws_s3:dist',
    // 'aws_s3:assets'
  ])

  grunt.registerTask('default', [
    // 'newer:eslint',
    'build'
    // 'htmlproof'
  ])
}

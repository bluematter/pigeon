'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var babel = require('babelify');
var nodemon = require('nodemon');
var browserSync = require('browser-sync');


// Gulp Styles (compile sass and make source map)
gulp.task('styles', () => {
  var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'public/sass/**/*.scss'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('public/styles'));
});


// Gulp Browserify (compile javascript)
gulp.task('browserify', () => {
    return gulp.src('public/client/DirectChatApp/main.js')
        .pipe($.browserify({
          transform: ['hbsfy', babel]
        }))
        .pipe($.rename('direct_chat_app.js'))
        .pipe(gulp.dest('public/scripts'))
});


// Gulp BrowserSync ()
gulp.task('browser-sync', ['nodemon'], () => {
    browserSync.init(null, {
        proxy: "http://localhost:2345",
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000,
    });

    gulp.watch(['public/sass/**/*.{scss,css}'], ['styles', browserSync.reload]);
});

// Gulp Nodemon
gulp.task('nodemon', function (cb) {
    
    var started = false;
    
    return nodemon({
        script: 'pigeon.js'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true; 
        } else {
            //browserSync.reload
        }
    });
});


gulp.task('default', ['nodemon'], function () {});
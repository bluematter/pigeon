'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var babel = require('babelify');

// Compile and automatically prefix stylesheets
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

// Browserify
gulp.task('browserify', () => {
    return gulp.src('public/client/DirectChatApp/main.js')
        .pipe($.browserify({
          transform: ['hbsfy', babel]
        }))
        .pipe($.rename('direct_chat_app.js'))
        .pipe(gulp.dest('public/scripts'))
});

gulp.task('start', function () {
    $.nodemon({
        script: 'pigeon.js', 
        ext: 'js html',
        tasks: ['styles', 'browserify'],
        env: { 'NODE_ENV': 'development' }
    })
});
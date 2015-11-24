var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

// BROWSERIFY TASK: compiles both chat app javascripts
gulp.task('browserify-direct', function () {
    return gulp.src('public/client/DirectChatApp/main.js')
        .pipe(plugins.browserify({
          transform: ['hbsfy']
        }))
        .pipe(plugins.rename('direct_chat_app.js'))
        .pipe(gulp.dest('public/scripts'))
});
gulp.task('browserify-room', function () {
    return gulp.src('public/client/RoomsChatApp/main.js')
        .pipe(plugins.browserify({
          transform: ['hbsfy']
        }))
        .pipe(plugins.rename('rooms_chat_app.js'))
        .pipe(gulp.dest('public/scripts'))
});
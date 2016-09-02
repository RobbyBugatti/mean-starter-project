var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var count = require('gulp-count');
var watch = require('gulp-watch');
var rename = require('gulp-rename');

var paths = {
    scripts : [
        './public/js/core.js',
        './public/js/routes.js',
        './public/js/components/*.js',
        './public/js/components/*/*.js',
        './public/js/filters/*.js',
        './public/js/modules/*.js',
    ],
    styles : [

    ]
}
gulp.task('concat', function() {
    return gulp.src(paths.scripts)
    .pipe(count('## js-files selected'))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./public'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['concat']);
})

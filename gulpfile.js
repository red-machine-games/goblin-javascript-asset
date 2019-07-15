'use strict';

var browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    gulp = require('gulp');

const config = { js: {
    src: './index.js',
    outputDir: './build/',
    outputFile: `gbase-html5-${require('./package.json').version}-min.js`
}};

gulp.task('bundle', () => {
    var bundler = browserify(config.js.src);

    return bundler
        .bundle()
        .pipe(source(config.js.src))
        .pipe(buffer())
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(uglify())
        .pipe(rename(config.js.outputFile))
        .pipe(gulp.dest(config.js.outputDir));
});
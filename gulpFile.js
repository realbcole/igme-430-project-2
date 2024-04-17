const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const webpack = require('webpack-stream');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint-new');
const webpackConfig = require('./webpack.config.js');

const sassTask = done => {
    gulp.src('./scss/main.scss') // Load file
        .pipe(sass().on('error', sass.logError)) // Convert to sass
        .pipe(gulp.dest('./hosted/')); // Save to hosted folder as css

    done();
};

const jsTask = done => {
    webpack(webpackConfig)
        .pipe(gulp.dest('./hosted/'));

    done();
};

const lintTask = done => {
    gulp.src('./server/**/*.js')
        .pipe(eslint({ fix: true }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());

    done();
};

const watch = done => {
    gulp.watch('./scss', sassTask);
    gulp.watch(['./client/**/*.js', './client/**/*.jsx'], jsTask);

    nodemon({
        script: './server/app.js',
        tasks: ['lintTask'],
        watch: ['./server'],
        done: done,
    });
};

module.exports = {
    sassTask,
    jsTask,
    lintTask,
    build: gulp.parallel(sassTask, jsTask, lintTask),
    watch,
    herokuBuild: gulp.parallel(sassTask, jsTask),
};

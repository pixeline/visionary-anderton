'use strict';
//npm install gulp gulp-minify-css gulp-uglify gulp-clean gulp-cleanhtml gulp-jshint gulp-strip-debug gulp-zip --save-dev
var gulp = require('gulp'),
	clean = require('gulp-clean'),
	cleanhtml = require('gulp-cleanhtml'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	stripdebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	zip = require('gulp-zip');
var sass = require('gulp-sass');
var browsersync = require('browser-sync').create();
const runSequence = require('run-sequence');
//clean build directory
gulp.task('clean', function() {
	return gulp.src('./build/*', {
		read: false
	}).pipe(clean());
});
//copy static folders to build directory
gulp.task('copy', function() {
	gulp.src('./src/assets/fonts/**').pipe(gulp.dest('./build/assets/fonts'));
	gulp.src('./src/icons/**').pipe(gulp.dest('./build/icons'));
	gulp.src('./src/_locales/**').pipe(gulp.dest('./build/_locales'));
	return gulp.src('./src/manifest.json').pipe(gulp.dest('./build'));
});
//copy and compress HTML files
gulp.task('html', function() {
	return gulp.src('./src/*.html').pipe(cleanhtml()).pipe(gulp.dest('./build'));
});

gulp.task('images', function() {
	gulp.src('./src/assets/images/**').pipe(gulp.dest('./build/assets/images'));
});


//run scripts through JSHint
gulp.task('jshint', function() {
	return gulp.src('./src/assets/js/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
});

//copy vendor scripts and uglify all other scripts, creating source maps
gulp.task('scripts', ['jshint'], function() {
	gulp.src('./src/assets/js/vendors/**/*.js').pipe(gulp.dest('./build/assets/js/vendors'));
	return gulp.src(['./src/assets/js/**/*.js', '!src/assets/js/vendors/**/*.js']).pipe(stripdebug()).pipe(uglify({
		outSourceMap: true
	})).pipe(gulp.dest('./build/assets/js'));
});


//minify styles
gulp.task('styles', ['sass'], function() {
	return gulp.src('./src/assets/css/**').pipe(minifycss({
		root: './src/assets/css',
		keepSpecialComments: 0
	})).pipe(gulp.dest('./build/assets/css'));
});
gulp.task('sass', function() {
	return gulp.src('./src/assets/scss/*.scss').pipe(sass().on('error', sass.logError)).pipe(gulp.dest('./src/assets/css'));
});
//build ditributable and sourcemaps after other tasks completed
gulp.task('zip', ['html', 'scripts', 'styles', 'copy'], function() {
	var manifest = require('./src/manifest'),
		distFileName = manifest.name + ' v' + manifest.version + '.zip',
		mapFileName = manifest.name + ' v' + manifest.version + '-maps.zip';
	//collect all source maps
	gulp.src('./build/assets/js/**/*.map').pipe(zip(mapFileName)).pipe(gulp.dest('./dist'));
	//build distributable extension
	return gulp.src(['./build/**', '!build/assets/js/**/*.map']).pipe(zip(distFileName)).pipe(gulp.dest('./dist'));
});
//run all tasks after build directory has been cleaned
gulp.task('release', ['clean'], function() {
	gulp.start('zip');
});
// Browsersync tasks
gulp.task('browser-sync', function() {
	browsersync.init({
		server: {
			baseDir: ['./build']
		},
		files: ['./build/**/*'],
		notify: false,
		port: 2017
	});
});
gulp.task('browsersync-reload', function() {
	browsersync.reload({
		stream: true
	});
});
gulp.task('watch', ['browser-sync'], function() {
	gulp.watch(['./src/*.html'], ['html']);
	gulp.watch(['./src/*.html'], ['copy']);
	gulp.watch(['./src/assets/scss/**/*.scss'], ['styles']);
	gulp.watch(['./src/assets/images/**/*'], ['images']);
	gulp.watch(['./src/assets/js/**/*.js'], ['scripts', 'browsersync-reload']);
});
gulp.task('default', ['build','watch']);
gulp.task('build', function() {	
	runSequence(
	'clean',
	'copy',
	'images', 
	'html', 
	'styles', 
	'scripts',
	function(error) {
		if (error) {
			console.log(error.message);
		}
	});
});
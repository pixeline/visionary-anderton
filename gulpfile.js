'use strict';
var gulp = require('gulp'),
	clean = require('gulp-clean'),
	cleanhtml = require('gulp-cleanhtml'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	stripdebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	zip = require('gulp-zip'),
	sass = require('gulp-sass'),
	prompt = require('gulp-prompt'),
	semver = require('semver'),
	replace = require('gulp-replace'),
	browsersync = require('browser-sync').create(),
	runSequence = require('run-sequence'),
	bump = require('gulp-bump');

var project = require('./project.json');
var pkg = require('./package.json');
var app_version = pkg.version;



//clean build directory
gulp.task('clean', function() {
	return gulp.src(project.build_dir + '/*', {
		read: false
	}).pipe(clean());
});


//copy static folders to build directory

gulp.task('copy', function() {

	return gulp.src(['**/*', '!**/.*', '!/assets/scss', '!/assets/js'], {
		cwd: project.src_dir + '/**'
	}).pipe(gulp.dest(project.build_dir));

});


gulp.task('clean:html', function() {
	//copy and compress HTML files
	return gulp.src(project.build_dir + '/*.html').pipe(cleanhtml()).pipe(gulp.dest(project.build_dir));
});

//run scripts through JSHint
gulp.task('jshint', function() {
	return gulp.src(project.src_dir + '/assets/js/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
});

//copy vendor scripts and uglify all other scripts, creating source maps
gulp.task('scripts', function() {
	gulp.src(project.src_dir + '/assets/js/vendors/**/*.js')
	.pipe(gulp.dest(project.build_dir + '/assets/js/vendors'));

	return gulp.src([project.src_dir + '/assets/js/*.js'])

	.pipe(gulp.dest(project.build_dir + '/assets/js'));
});


//minify styles
gulp.task('styles', function() {
	return gulp.src(project.src_dir + '/assets/css/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest(project.build_dir + '/assets/css'));
});
/*
gulp.task('sass', function() {
	return gulp.src(project.src_dir + '/assets/scss/*.scss').pipe(sass().on('error', sass.logError)).pipe(gulp.dest(project.src_dir + '/assets/css'));
});
*/

//build ditributable and sourcemaps after other tasks completed
gulp.task('zip', function() {
		//build distributable extension
		return gulp.src([project.build_dir + '/**/*']).pipe(zip( project.project_name + '-' + app_version + '.zip')).pipe(gulp.dest(project.distr_dir));
	});

//run all tasks after build directory has been cleaned
gulp.task('release', function() {
	runSequence('clean', 'copy', 'styles', 'scripts', 'version:bump', 'cache:bust', 'clean:html', 'zip');
});

gulp.task('default', ['build']);

gulp.task('build', function() {
	return runSequence('clean', 'copy', 'styles', 'scripts', 'cache:bust', 'clean:html', function(error) {
		if (error) {
			console.log(error.message);
		}
	});
});

gulp.task("version:bump", function() {
	// Versioning update.
	return gulp.src("*").pipe(
	prompt.prompt({
		type: 'list',
		name: 'bump',
		message: 'Which type of release: "patch", "minor", or "major" ?',
		choices: ['patch', 'minor', 'major'],
	default:
		'patch'
	}, function(res) {
		//value is in res.bump
		app_version = semver.inc(pkg.version, res.bump);
		return gulp.src("./package.json").pipe(bump({
			type: res.bump
		})).pipe(gulp.dest("./"));
	}));
});
gulp.task('cache:bust', ['copy'], function() {
	// Append app version to CSS/JS dependencies.
	return gulp.src([project.build_dir + '/*.html', project.build_dir + '/manifest.json']).pipe(replace('{VERSION}', app_version)).pipe(gulp.dest(project.build_dir));
});


/// NOT USED ANYMORE
//gulp.task('watch', ['browser-sync'], function() {
gulp.task('watch', ['default'], function() {
	gulp.watch([project.src_dir + '/**/*.{html,jpeg,png,gif,jpg,json}'], ['copy', 'cache:bust']);
	gulp.watch([project.src_dir + '/assets/css/*.scss'], ['styles']);
	gulp.watch([project.src_dir + '/assets/js/**/*.js'], ['scripts']);
});


// Browsersync tasks
gulp.task('browser-sync', function() {
	browsersync.init({
		server: {
			baseDir: [project.build_dir]
		},
		files: [project.build_dir + '/**/*'],
		notify: false,
		port: 2017
	});
});
gulp.task('browsersync-reload', function() {
	browsersync.reload({
		stream: true
	});
});
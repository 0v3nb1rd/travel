					///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////	--	GulpFile by Nazar K. 11.2018	--	////////////////////////////////////////////
					///////////////////////////////////////////////////////////////////////////////////////////////////////
var gulp          = require('gulp'),								///	Gulp
		sass          = require('gulp-sass'),						///	compile SASS to CSS
		gutil         = require('gulp-util' ),
		browserSync   = require('browser-sync'),				///	browser-sync
		concat        = require('gulp-concat'),					///	concatination
		uglify        = require('gulp-uglify'),					///	minify JavaScript
		cleanCSS      = require('gulp-clean-css'),			/// minify CSS
		rename        = require('gulp-rename'),					///	rename
		del         	= require('del'),									///	delated files
		imagemin			= require('gulp-imagemin'),				///	minify Image
		pngquant			= require('imagemin-pngquant'),	
		cache					= require('gulp-cache');			
		autoprefixer  = require('gulp-autoprefixer'),		///	autoprefixer
		notify        = require('gulp-notify'),
		ftp           = require('vinyl-ftp'),
		rsync         = require('gulp-rsync'),		

		run         	= require('run-sequence'),				///	run a series of gulp tasks in order.
		htmlmin				= require('gulp-htmlmin'),				/// minify HTML


gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'src'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('styles', function () {
  return gulp.src('src/scss/*.scss')
		.pipe(sass({ outputStyle: 'expanded' }).on('error', notify.onError()))
		.pipe(rename({ suffix: '.min', prefix : '' }))
		.pipe(autoprefixer(['last 15 versions', '> 0.1%'], {cascade: true}))
		// .pipe(cleanCSS({level: { 2: { specialComments: 0 } } }))
		.pipe(gulp.dest('src/css'))
		.pipe(browserSync.stream())
});

gulp.task('js', function() {
	return gulp.src([
		'src/libs/jquery/dist/jquery.min.js',
		// 'node_modules/bootstrap/dist/js/bootstrap.min.js',

		'src/js/common.js' // Always at the end
		])
	.pipe(concat('main.min.js'))
	// .pipe(uglify({ toplevel: true})) // Mifify js (opt.)
	.pipe(gulp.dest('src/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('watch', ['styles', 'js', 'browser-sync'], function() {
	gulp.watch('src/scss/**/*.scss', ['styles']);
	gulp.watch(['libs/**/*.js', 'src/js/common.js'], ['js']);
	gulp.watch('src/*.html', browserSync.reload)
});

gulp.task('default', ['watch']);


					/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////	--	Build	--	////////////////////////////////////////////////////////

gulp.task('build', ['del', 'imagemin', 'styles', 'js'], function() {

	var buildFiles = gulp.src([
		'src/*.html',
		'src/.htaccess'])
		.pipe(gulp.dest('dist/'));

	var buildCSS = gulp.src('src/css/main.min.css')
		.pipe(gulp.dest('dist/css'));

	var buildJS = gulp.src('src/js/main.min.js')
	.pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{ removeViewBox: false }],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img/'))
});

gulp.task('del', function() {
  return del.sync('dist');
});

gulp.task('clear', function() {
  return cache.clearAll();
});

gulp.task("minhtml", function() {
  return gulp.src("app/*.html")
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest("dist"));
});

// gulp.task('build', function(done) {
// 	run('clear', 'copy', 'minhtml', 'minimg', done)
// });

				///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////	--	Deploy to:	--	////////////////////////////////////////////////

gulp.task('rsync', function() {
	return gulp.src('dist/**')
	.pipe(rsync({
		root: 'dist/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('deploy', function() {
	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});
	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));
});
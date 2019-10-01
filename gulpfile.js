					///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////	--	GulpFile by Nazar K. 11.2018	--	////////////////////////////////////////////
					///////////////////////////////////////////////////////////////////////////////////////////////////////
var gulp          = require('gulp'),								///	Gulp
		sass          = require('gulp-sass'),						///	compile SASS to CSS
	browserSync   = require('browser-sync'),				///	browser-sync
		concat        = require('gulp-concat'),					///	concatination
		uglify        = require('gulp-uglify-es').default,					///	minify JavaScript
		cleancss      = require('gulp-clean-css'),			/// minify CSS
		autoprefixer  = require('gulp-autoprefixer'),		///	autoprefixer
		rsync         = require('gulp-rsync'),		
		newer        = require('gulp-newer'),
		rename        = require('gulp-rename'),					///	rename
		responsive   = require('gulp-responsive'),
		del         	= require('del'),									///	delated files

		gutil         = require('gulp-util'),
		notify        = require('gulp-notify'),
		ftp           = require('vinyl-ftp'),
		htmlmin				= require('gulp-htmlmin'),				/// minify HTML
		imagemin			= require('gulp-imagemin'),				///	minify Image
		pngquant			= require('imagemin-pngquant');

// Local Server
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
function bsReload(done) { browserSync.reload(); done(); };

// Custom Styles
gulp.task('styles', function() {
	return gulp.src('src/scss/*.scss')
	.pipe(sass({
		outputStyle: 'expanded',
		includePaths: [__dirname + '/node_modules']
	}).on('error', notify.onError()))
	.pipe(concat('styles.min.css'))
	.pipe(autoprefixer({
		grid: true,
		overrideBrowserslist: ['last 10 versions']
	}))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
	.pipe(gulp.dest('src/css'))
	.pipe(browserSync.stream())
});

// Scripts & JS Libraries
gulp.task('js', function() {
	return gulp.src([
		'node_modules/jquery/dist/jquery.min.js', // Optional jQuery plug-in (npm i --save-dev jquery)
		// 'node_modules/bootstrap/dist/js/bootstrap.min.js',

		// 'src/js/common.js', // Always at the end
		'src/js/_libs.js', // JS libraries (all in one)
		'src/js/_custom.js', // Custom scripts. Always at the end
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify({ toplevel: true})) // Mifify js (opt.)
	.pipe(gulp.dest('src/js'))
	.pipe(browserSync.reload({ stream: true }))
});

// Responsive Images
var quality = 95; // Responsive images quality

// Produce @1x images
gulp.task('img-responsive-1x', async function() {
	return gulp.src('src/img/_src/**/*.{png,jpg,jpeg,webp,raw}')
		.pipe(newer('src/img/@1x'))
		.pipe(responsive({
			'**/*': { width: '50%', quality: quality }
		})).on('error', function (e) { console.log(e) })
		.pipe(rename(function (path) {path.extname = path.extname.replace('jpeg', 'jpg')}))
		.pipe(gulp.dest('src/img/@1x'))
});
// Produce @2x images
gulp.task('img-responsive-2x', async function() {
	return gulp.src('src/img/_src/**/*.{png,jpg,jpeg,webp,raw}')
		.pipe(newer('src/img/@2x'))
		.pipe(responsive({
			'**/*': { width: '100%', quality: quality }
		})).on('error', function (e) { console.log(e) })
		.pipe(rename(function (path) {path.extname = path.extname.replace('jpeg', 'jpg')}))
		.pipe(gulp.dest('src/img/@2x'))
});
gulp.task('img', gulp.series('img-responsive-1x', 'img-responsive-2x', bsReload));

// Clean @*x IMG's
gulp.task('cleanimg', function() {
	return del(['src/img/@*'], { force: true })
});

// Code & Reload
gulp.task('code', function() {
	return gulp.src('src/**/*.html')
	.pipe(browserSync.reload({ stream: true }))
});

//Font-awesome copy fonts
gulp.task('icons', function() {
	return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
	 .pipe(gulp.dest('src/webfonts'));
});


gulp.task('watch', function() {
	gulp.watch('src/scss/**/*.scss', gulp.parallel('styles'));
	gulp.watch(['src/js/_libs.js', 'src/js/_custom.js'], gulp.parallel('js'));
	gulp.watch('src/*.html', gulp.parallel('code'));
	gulp.watch('src/img/_src/**/*', gulp.parallel('img'));
});

gulp.task('default', gulp.parallel('img', 'styles', 'icons', 'js', 'browser-sync', 'watch'));



					/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////	--	Build	--	////////////////////////////////////////////////////////

// gulp.task('build', ['del', 'imagemin', 'styles', 'js'], function() {

// 	var buildFiles = gulp.src([
// 		'src/*.html',
// 		'src/.htaccess'])
// 		.pipe(gulp.dest('dist/'));

// 	var buildCSS = gulp.src('src/css/main.min.css')
// 		.pipe(gulp.dest('dist/css'));

// 	var buildJS = gulp.src('src/js/main.min.js')
// 	.pipe(gulp.dest('dist/js'));

// 	var buildFonts = gulp.src('src/fonts/**/*')
// 		.pipe(gulp.dest('dist/fonts'));

// });

// gulp.task('imagemin', function() {
// 	return gulp.src('app/img/**/*')
// 	.pipe(cache(imagemin({
// 		interlaced: true,
// 		progressive: true,
// 		svgoPlugins: [{ removeViewBox: false }],
// 		use: [pngquant()]
// 	})))
// 	.pipe(gulp.dest('dist/img/'))
// });

// gulp.task('del', function() {
//   return del.sync('dist');
// });

// gulp.task('clear', function() {
//   return cache.clearAll();
// });

// gulp.task("minhtml", function() {
//   return gulp.src("app/*.html")
//   .pipe(htmlmin({collapseWhitespace: true}))
//   .pipe(gulp.dest("dist"));
// });

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

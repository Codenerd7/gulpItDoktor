// Импорт пакетов
const gulp = require('gulp')
const less = require('gulp-less')
const stylus = require('gulp-stylus')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
//const ts = require('gulp-typescript')
//const coffee = require('gulp-coffee')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
//const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
//const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
const gulppug = require('gulp-pug')
const newer = require('gulp-newer')
const browsersync = require('browser-sync').create()
const del = require('del')

// Пути исходных файлов src и пути к результирующим файлам dest
const paths = {
	pug: {
		src: 'src/*.pug',
		dest: 'dist/'
	},
	html: {
		src: 'src/*.html',
		dest: 'dist/'
	},
	styles: {
		src: ['src/styles/**/*.sass', 'src/styles/**/*.scss', 'src/styles/**/*.styl', 'src/styles/**/*.less', 'src/styles/**/*.css'],
		dest: 'dist/css/'
	},
	scripts: {
		src: ['src/scripts/**/*.coffee', 'src/scripts/**/*.ts', 'src/scripts/**/*.js'],
		dest: 'dist/js/'
	},
	images: {
		src: 'src/img/**',
		dest: 'dist/img/'
	}
}

// Очистить каталог dist, удалить все кроме изображений
function clean() {
	return del(['dist/*', '!dist/img'])
}

// Обработка pug
function pug() {
	return gulp.src(paths.pug.src)
		.pipe(gulppug())
		.pipe(size({
			showFiles: true
		}))
		.pipe(gulp.dest(paths.pug.dest))
		.pipe(browsersync.stream())
}

// Обработка html
/*function html() {
	return gulp.src(paths.html.src)
		.pipe(htmlmin({ collapseWhitespace: false }))
		.pipe(size({
			showFiles: true
		}))
		.pipe(gulp.dest(paths.html.dest))
		.pipe(browsersync.stream())
}*/

// Обработка препроцессоров стилей
function styles() {
	return gulp.src(paths.styles.src)
		//.pipe(sourcemaps.init())
		//.pipe(less())
		//.pipe(stylus())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			cascade: false
		}))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(rename({
			basename: 'style',
			suffix: '.min'
		}))
		//.pipe(sourcemaps.write('.'))
		.pipe(size({
			showFiles: true
		}))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browsersync.stream())
}

// Обработка Java Script, Type Script и Coffee Script
function scripts() {
	return gulp.src(paths.scripts.src)
		//.pipe(sourcemaps.init())
		//.pipe(coffee({bare: true}))
		/*
		.pipe(ts({
			noImplicitAny: true,
			outFile: 'main.min.js'
		}))
		*/
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(uglify())
		.pipe(concat('main.min.js'))
		//.pipe(sourcemaps.write('.'))
		.pipe(size({
			showFiles: true
		}))
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(browsersync.stream())
}

// Сжатие изображений
function img() {
	return gulp.src(paths.images.src)
		.pipe(newer(paths.images.dest))
		.pipe(imagemin({
			progressive: true
		}))
		.pipe(size({
			showFiles: true
		}))
		.pipe(gulp.dest(paths.images.dest))
}

// Отслеживание изменений в файлах и запуск лайв сервера
function watch() {
	browsersync.init({
		server: {
			baseDir: "./dist"
		}
	})
	gulp.watch(paths.html.dest).on('change', browsersync.reload)
	gulp.watch(paths.pug.src, pug)
	gulp.watch(paths.styles.src, styles)
	gulp.watch(paths.scripts.src, scripts)
	gulp.watch(paths.images.src, img)
}

// Таски для ручного запуска с помощью gulp clean, gulp html и т.д.
exports.clean = clean
exports.pug = pug
//exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.img = img
exports.watch = watch

// Таск, который выполняется по команде gulp
exports.default = gulp.series(clean, pug, gulp.parallel(styles, scripts, img), watch)

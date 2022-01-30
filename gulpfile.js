let project_folder = "dist";
let source_folder = "src";
let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        jsLibs: source_folder + "/js/libs.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/**/*"
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        jsLibs: source_folder + "/js/libs.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/"

}

let { src, dest } = require('gulp');
let gulp = require('gulp');

let browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    groupMedia = require('gulp-group-css-media-queries'),
    cleanCss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2');

function BrowserSync() {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        browser: "chrome",
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        // .pipe(fileinclude())
        //.pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe(groupMedia())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(
            cleanCss({
                level: 2
            })
        )
        .pipe(
            rename({
                extname: '.min.css'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

function jsLibs() {
    return src(path.src.jsLibs)
        .pipe(fileinclude())
        .pipe(uglify())
        .pipe(
            rename({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    //gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.css]).on('change', gulp.series(css, browsersync.reload));
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.jsLibs], jsLibs);
    gulp.watch([path.watch.img], images);
    //gulp.watch([path.watch.css]).on('change', gulp.series(images, browsersync.reload));
}

function clean() {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(/*jsLibs,*/ js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, BrowserSync);

exports.css = css;
exports.fonts = fonts;
/*exports.jsLibs = jsLibs;*/
exports.images = images;
exports.js = js;
exports.html = html;
exports.build = build;
exports.default = watch;
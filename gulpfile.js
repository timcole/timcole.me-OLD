var gulp = require("gulp");
var sass = require("gulp-sass");

gulp.task("sass", function () {
	console.log("Compiling new SCSS changes...")
	return gulp.src("./public/scss/main.scss")
		.pipe(sass({
			outputStyle: "compressed"
		}).on("error", sass.logError))
		.pipe(gulp.dest("./public/css"));
});

gulp.task("sass:watch", function () {
	gulp.watch("./public/scss/**/*.scss", ["sass"]);
});

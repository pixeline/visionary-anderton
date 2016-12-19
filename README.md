# visionary-anderton
L'extension chrome


## setup dev environment

To Install Gulp, in your Terminal type:

1. `npm install --global gulp-cli`
2. `npm install gulp gulp-minify-css gulp-uglify gulp-clean gulp-cleanhtml jshint gulp-jshint gulp-strip-debug gulp-zip --save-dev`
3. `npm update` to install remaining packages.

## starting your work...

`gulp` : This tasks cleans up the build folder then compiles js/css files, then serves the `build/`folder via URL: [http://localhost:2017](http://localhost:2017). It watches any changes you make on your js and scss folders, and live reload (via browserSync) your browser to reflect thoses changes. It is perfect for quick development.  In the background, it compiles any changes to the `./build` folder.

## publishing the extension on the Play Store

`gulp release` : this task creates the zip file in the `dist/`folder, that you can submit to the Play Store.



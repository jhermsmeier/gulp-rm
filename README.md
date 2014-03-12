gulp-rm
=======

Install with [npm](https://npmjs.org)
-------------------------------------
```sh
$ npm install --save-dev gulp-rm
```

Usage
-----

Passing `{ read: false }` to `gulp.src()` prevents gulp from
reading in the contents of files and thus speeds up the whole process.

```javascript
var gulp = require( 'gulp' )
var rm = require( 'gulp-rm' )

gulp.task( 'clean:tmp', function() {
  return gulp.src( 'app/tmp/**/*', { read: false })
    .pipe( rm() )
})
```

To force sync `fs` operations, pass `async: false` to `rm()`:

```javascript
gulp.task( 'clean:tmp', function() {
  return gulp.src( 'app/tmp/**/*', { read: false })
    .pipe( rm({ async: false }) )
})
```

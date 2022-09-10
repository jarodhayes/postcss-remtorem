# postcss-remtorem [![NPM version](https://badge.fury.io/js/postcss-remtorem.svg)](http://badge.fury.io/js/postcss-remtorem)

A plugin for [PostCSS](https://github.com/ai/postcss) that adjusts `rem` units to a match a non-standard base unit size.

Based on the [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem) plugin by [cuth](https://github.com/cuth).

## Install

```shell
$ npm install postcss postcss-remtorem --save-dev
```

## Why Does This Exist / Usage Scenario

The default root em size used by most browers is `1rem = 16px`, but if you are working within a project using a non-standard root em size that you cannot change (e.g. `1rem = 10px`), then this plugin might be useful for adjusting 3rd party stylesheets/frameworks to have appropriate element sizing out of the box.

## Usage Example

```js
"use strict";

var fs = require('fs');
var postcss = require('../node_modules/postcss');
var remtorem = require('../');
var css = fs.readFileSync('main.css', 'utf8');
var processedCss = postcss(remtorem()).process(css).css;

fs.writeFile('main-rem.css', processedCss, function (err) {
  if (err) {
    throw err;
  }
  console.log('main-rem.css file written.');
});

```

### Result
```css
// Input (main.css)
h1 {
    margin: 0 0 1rem;
    font-size: 2rem;
    line-height: 1.2;
    letter-spacing: 1px;
}

// Output (main-rem.css)
h1 {
    margin: 0 0 1.6rem;
    font-size: 3.2rem;
    line-height: 1.2;
    letter-spacing: 1px;
}
```

## Options

Type: `Object | null`
Default:
```js
{
    rootValue: 10,
    unitPrecision: 5,
    propList: ['*'],
    selectorBlackList: [],
    mediaQuery: false,
    minRemValue: 0,
    exclude: null
}
```

- `rootValue` (Number) The root element font size of your project. E.g. If set to 10, rem values will be increased by 1.6x (16/10)
- `unitPrecision` (Number) The decimal numbers to allow the REM units to grow to.
- `propList` (Array) The properties for which rem values will be adjusted
    - Values need to be exact matches.
    - Use wildcard `*` to enable all properties. Example: `['*']`
    - Use `*` at the start or end of a word. (`['*position*']` will match `background-position-y`)
    - Use `!` to not match a property. Example: `['*', '!letter-spacing']`
    - Combine the "not" prefix with the other prefixes. Example: `['*', '!font*']`
- `selectorBlackList` (Array) The selectors to ignore and leave as px.
    - If value is string, it checks to see if selector contains the string.
        - `['body']` will match `.body-class`
    - If value is regexp, it checks to see if the selector matches the regexp.
        - `[/^body$/]` will match `body` but not `.body`
- `mediaQuery` (Boolean) Allow px to be converted in media queries.
- `minPixelValue` (Number) Set the minimum pixel value to replace.
- `exclude` (String, Regexp, Function) The file path to ignore and leave as px.
    - If value is string, it checks to see if file path contains the string.
        - `'exclude'` will match `\project\postcss-remtorem\exclude\path`
    - If value is regexp, it checks to see if file path matches the regexp.
        - `/exclude/i` will match `\project\postcss-remtorem\exclude\path`
    - If value is function, you can use exclude function to return a true and the file will be ignored.
        - the callback will pass the file path as  a parameter, it should returns a Boolean result.
        - `function (file) { return file.indexOf('exclude') !== -1; }`

### Use with gulp-postcss and autoprefixer

```js
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var remtorem = require('postcss-remtorem');

gulp.task('css', function () {

    var processors = [
        autoprefixer({
            browsers: 'last 1 version'
        }),
        remtorem({
            replace: false
        })
    ];

    return gulp.src(['build/css/**/*.css'])
        .pipe(postcss(processors))
        .pipe(gulp.dest('build/css'));
});
```

### A message about ignoring properties
Currently, the easiest way to have a single property ignored is to use a capital in the pixel unit declaration.

```css
// `rem` is converted
.convert {
    font-size: 1rem; // converted to 1.6rem
}

// `Rem` or `REM` is ignored by `postcss-remtorem` but still accepted by browsers
.ignore {
    border: 1Rem solid; // ignored
    border-width: 2REM; // ignored
}
```

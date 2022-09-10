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

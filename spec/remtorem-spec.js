// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

/* global describe, it, expect */

"use strict";
var postcss = require("postcss");
var remtorem = require("..");
var basicCSS = ".rule { font-size: 1rem }";
var filterPropList = require("../lib/filter-prop-list");

describe("remtorem", function() {
  it("should work on the readme example", function() {
    var input =
      "h1 { margin: 0 0 20px; font-size: 3rem; line-height: 1.2; letter-spacing: 0.0625rem; }";
    var output =
      "h1 { margin: 0 0 20px; font-size: 4.8rem; line-height: 1.2; letter-spacing: 0.1rem; }";
    var processed = postcss(remtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it("should adjust rem unit", function() {
    var processed = postcss(remtorem()).process(basicCSS).css;
    var expected = ".rule { font-size: 1.6rem }";

    expect(processed).toBe(expected);
  });

  it("should ignore non rem properties", function() {
    var expected = ".rule { font-size: 2em }";
    var processed = postcss(remtorem()).process(expected).css;

    expect(processed).toBe(expected);
  });

  it("should handle < 1 values and values without a leading 0", function() {
    var rules = ".rule { margin: 0.5px .5rem -0.2rem -.2em }";
    var expected = ".rule { margin: 0.5px 0.8rem -0.32rem -.2em }";
    var options = {
      propWhiteList: ["margin"]
    };
    var processed = postcss(remtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should ignore rem in custom property names", function() {
    var rules =
      ":root { --rem-14rem: 1.4rem; } .rule { font-size: var(rem-14rem); }";
    var expected =
      ":root { --rem-14rem: 2.24rem; } .rule { font-size: var(rem-14rem); }";
    var options = {
      propList: ["--*", "font-size"]
    };
    var processed = postcss(remtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should remain unitless if 0", function() {
    var expected = ".rule { font-size: 0rem; font-size: 0px; font-size: 0; }";
    var processed = postcss(remtorem()).process(expected).css;

    expect(processed).toBe(expected);
  });
});

describe("value parsing", function() {
  it("should not replace values in double quotes or single quotes", function() {
    var rules =
      ".rule { content: '1.6rem'; font-family: \"1.6rem\"; font-size: 1.6rem; }";
    var expected =
      ".rule { content: '1.6rem'; font-family: \"1.6rem\"; font-size: 2.56rem; }";
    var processed = postcss(remtorem()).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values in `url()`", function() {
    var rules = ".rule { background: url(1rem.jpg); font-size: 1rem; }";
    var expected = ".rule { background: url(1rem.jpg); font-size: 1.6rem; }";
    var processed = postcss(remtorem()).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values with an uppercase R, E, or M", function() {
    var options = {
      propList: ["*"]
    };
    var rules =
      ".rule { margin: 0.75rem calc(100% - 14REM); height: calc(100% - 1.25rem); font-size: 12ReM; line-height: 1rem; }";
    var expected =
      ".rule { margin: 1.2rem calc(100% - 14REM); height: calc(100% - 2rem); font-size: 12ReM; line-height: 1.6rem; }";
    var processed = postcss(remtorem(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

// describe("rootValue", function() {
//   // Deprecate
//   it("should replace using a root value of 10 - legacy", function() {
//     var expected = ".rule { font-size: 1.5rem }";
//     var options = {
//       root_value: 10
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS).css;

//     expect(processed).toBe(expected);
//   });

//   it("should replace using a root value of 10", function() {
//     var expected = ".rule { font-size: 1.5rem }";
//     var options = {
//       rootValue: 10
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS).css;

//     expect(processed).toBe(expected);
//   });

//   it("should replace using different root values with different files", function() {
//     var css2 = ".rule { font-size: 20px }";
//     var expected = ".rule { font-size: 1rem }";
//     var options = {
//       rootValue: function(input) {
//         if (input.from.indexOf("basic.css") !== -1) {
//           return 15;
//         }
//         return 20;
//       }
//     };
//     var processed1 = postcss(remtorem(options)).process(basicCSS, {
//       from: "/tmp/basic.css"
//     }).css;
//     var processed2 = postcss(remtorem(options)).process(css2, {
//       from: "/tmp/whatever.css"
//     }).css;

//     expect(processed1).toBe(expected);
//     expect(processed2).toBe(expected);
//   });
// });

// describe("unitPrecision", function() {
//   // Deprecate
//   it("should replace using a decimal of 2 places - legacy", function() {
//     var expected = ".rule { font-size: 0.94rem }";
//     var options = {
//       unit_precision: 2
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS).css;

//     expect(processed).toBe(expected);
//   });

//   it("should replace using a decimal of 2 places", function() {
//     var expected = ".rule { font-size: 0.94rem }";
//     var options = {
//       unitPrecision: 2
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS).css;

//     expect(processed).toBe(expected);
//   });
// });

// describe("propWhiteList", function() {
//   // Deprecate
//   it("should only replace properties in the white list - legacy", function() {
//     var expected = ".rule { font-size: 15px }";
//     var options = {
//       prop_white_list: ["font"]
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS).css;

//     expect(processed).toBe(expected);
//   });

//   it("should only replace properties in the white list - legacy", function() {
//     var expected = ".rule { font-size: 15px }";
//     var options = {
//       propWhiteList: ["font"]
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS).css;

//     expect(processed).toBe(expected);
//   });

//   it("should only replace properties in the white list - legacy", function() {
//     var css = ".rule { margin: 16px; margin-left: 10px }";
//     var expected = ".rule { margin: 1rem; margin-left: 10px }";
//     var options = {
//       propWhiteList: ["margin"]
//     };
//     var processed = postcss(remtorem(options)).process(css).css;

//     expect(processed).toBe(expected);
//   });

//   it("should only replace properties in the prop list", function() {
//     var css =
//       ".rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }";
//     var expected =
//       ".rule { font-size: 1rem; margin: 1rem; margin-left: 5px; padding: 5px; padding-right: 1rem }";
//     var options = {
//       propWhiteList: ["*font*", "margin*", "!margin-left", "*-right", "pad"]
//     };
//     var processed = postcss(remtorem(options)).process(css).css;

//     expect(processed).toBe(expected);
//   });

//   it("should only replace properties in the prop list with wildcard", function() {
//     var css =
//       ".rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }";
//     var expected =
//       ".rule { font-size: 16px; margin: 1rem; margin-left: 5px; padding: 5px; padding-right: 16px }";
//     var options = {
//       propWhiteList: ["*", "!margin-left", "!*padding*", "!font*"]
//     };
//     var processed = postcss(remtorem(options)).process(css).css;

//     expect(processed).toBe(expected);
//   });

//   it("should replace all properties when white list is empty", function() {
//     var rules = ".rule { margin: 16px; font-size: 15px }";
//     var expected = ".rule { margin: 1rem; font-size: 0.9375rem }";
//     var options = {
//       propWhiteList: []
//     };
//     var processed = postcss(remtorem(options)).process(rules).css;

//     expect(processed).toBe(expected);
//   });
// });

// describe("selectorBlackList", function() {
//   // Deprecate
//   it("should ignore selectors in the selector black list - legacy", function() {
//     var rules = ".rule { font-size: 15px } .rule2 { font-size: 15px }";
//     var expected = ".rule { font-size: 0.9375rem } .rule2 { font-size: 15px }";
//     var options = {
//       selector_black_list: [".rule2"]
//     };
//     var processed = postcss(remtorem(options)).process(rules).css;

//     expect(processed).toBe(expected);
//   });

//   it("should ignore selectors in the selector black list", function() {
//     var rules = ".rule { font-size: 15px } .rule2 { font-size: 15px }";
//     var expected = ".rule { font-size: 0.9375rem } .rule2 { font-size: 15px }";
//     var options = {
//       selectorBlackList: [".rule2"]
//     };
//     var processed = postcss(remtorem(options)).process(rules).css;

//     expect(processed).toBe(expected);
//   });

//   it("should ignore every selector with `body$`", function() {
//     var rules =
//       "body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }";
//     var expected =
//       "body { font-size: 1rem; } .class-body$ { font-size: 16px; } .simple-class { font-size: 1rem; }";
//     var options = {
//       selectorBlackList: ["body$"]
//     };
//     var processed = postcss(remtorem(options)).process(rules).css;

//     expect(processed).toBe(expected);
//   });

//   it("should only ignore exactly `body`", function() {
//     var rules =
//       "body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }";
//     var expected =
//       "body { font-size: 16px; } .class-body { font-size: 1rem; } .simple-class { font-size: 1rem; }";
//     var options = {
//       selectorBlackList: [/^body$/]
//     };
//     var processed = postcss(remtorem(options)).process(rules).css;

//     expect(processed).toBe(expected);
//   });
// });

// describe("replace", function() {
//   it("should leave fallback pixel unit with root em value", function() {
//     var options = {
//       replace: false
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS).css;
//     var expected = ".rule { font-size: 15px; font-size: 0.9375rem }";

//     expect(processed).toBe(expected);
//   });
// });

// describe("mediaQuery", function() {
//   // Deprecate
//   it("should replace px in media queries", function() {
//     var options = {
//       media_query: true
//     };
//     var processed = postcss(remtorem(options)).process(
//       "@media (min-width: 500px) { .rule { font-size: 16px } }"
//     ).css;
//     var expected = "@media (min-width: 31.25rem) { .rule { font-size: 1rem } }";

//     expect(processed).toBe(expected);
//   });

//   it("should replace px in media queries", function() {
//     var options = {
//       mediaQuery: true
//     };
//     var processed = postcss(remtorem(options)).process(
//       "@media (min-width: 500px) { .rule { font-size: 16px } }"
//     ).css;
//     var expected = "@media (min-width: 31.25rem) { .rule { font-size: 1rem } }";

//     expect(processed).toBe(expected);
//   });
// });

// describe("minPixelValue", function() {
//   it("should not replace values below minPixelValue", function() {
//     var options = {
//       propWhiteList: [],
//       minPixelValue: 2
//     };
//     var rules =
//       ".rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }";
//     var expected =
//       ".rule { border: 1px solid #000; font-size: 1rem; margin: 1px 0.625rem; }";
//     var processed = postcss(remtorem(options)).process(rules).css;

//     expect(processed).toBe(expected);
//   });
// });

// describe("filter-prop-list", function() {
//   it('should find "exact" matches from propList', function() {
//     var propList = [
//       "font-size",
//       "margin",
//       "!padding",
//       "*border*",
//       "*",
//       "*y",
//       "!*font*"
//     ];
//     var expected = "font-size,margin";
//     expect(filterPropList.exact(propList).join()).toBe(expected);
//   });

//   it('should find "contain" matches from propList and reduce to string', function() {
//     var propList = [
//       "font-size",
//       "*margin*",
//       "!padding",
//       "*border*",
//       "*",
//       "*y",
//       "!*font*"
//     ];
//     var expected = "margin,border";
//     expect(filterPropList.contain(propList).join()).toBe(expected);
//   });

//   it('should find "start" matches from propList and reduce to string', function() {
//     var propList = [
//       "font-size",
//       "*margin*",
//       "!padding",
//       "border*",
//       "*",
//       "*y",
//       "!*font*"
//     ];
//     var expected = "border";
//     expect(filterPropList.startWith(propList).join()).toBe(expected);
//   });

//   it('should find "end" matches from propList and reduce to string', function() {
//     var propList = [
//       "font-size",
//       "*margin*",
//       "!padding",
//       "border*",
//       "*",
//       "*y",
//       "!*font*"
//     ];
//     var expected = "y";
//     expect(filterPropList.endWith(propList).join()).toBe(expected);
//   });

//   it('should find "not" matches from propList and reduce to string', function() {
//     var propList = [
//       "font-size",
//       "*margin*",
//       "!padding",
//       "border*",
//       "*",
//       "*y",
//       "!*font*"
//     ];
//     var expected = "padding";
//     expect(filterPropList.notExact(propList).join()).toBe(expected);
//   });

//   it('should find "not contain" matches from propList and reduce to string', function() {
//     var propList = [
//       "font-size",
//       "*margin*",
//       "!padding",
//       "!border*",
//       "*",
//       "*y",
//       "!*font*"
//     ];
//     var expected = "font";
//     expect(filterPropList.notContain(propList).join()).toBe(expected);
//   });

//   it('should find "not start" matches from propList and reduce to string', function() {
//     var propList = [
//       "font-size",
//       "*margin*",
//       "!padding",
//       "!border*",
//       "*",
//       "*y",
//       "!*font*"
//     ];
//     var expected = "border";
//     expect(filterPropList.notStartWith(propList).join()).toBe(expected);
//   });

//   it('should find "not end" matches from propList and reduce to string', function() {
//     var propList = [
//       "font-size",
//       "*margin*",
//       "!padding",
//       "!border*",
//       "*",
//       "!*y",
//       "!*font*"
//     ];
//     var expected = "y";
//     expect(filterPropList.notEndWith(propList).join()).toBe(expected);
//   });
// });

// describe("exclude", function() {
//   it("should ignore file path with exclude RegEx", function() {
//     var options = {
//       exclude: /exclude/i
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS, {
//       from: "exclude/path"
//     }).css;
//     expect(processed).toBe(basicCSS);
//   });

//   it("should not ignore file path with exclude String", function() {
//     var options = {
//       exclude: "exclude"
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS, {
//       from: "exclude/path"
//     }).css;
//     expect(processed).toBe(basicCSS);
//   });

//   it("should not ignore file path with exclude function", function() {
//     var options = {
//       exclude: function(file) {
//         return file.indexOf("exclude") !== -1;
//       }
//     };
//     var processed = postcss(remtorem(options)).process(basicCSS, {
//       from: "exclude/path"
//     }).css;
//     expect(processed).toBe(basicCSS);
//   });
// });

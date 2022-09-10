const remRegex = require("./lib/rem-unit-regex");
const filterPropList = require("./lib/filter-prop-list");
const type = require("./lib/type");

const remDeclProcessed = Symbol('isRemProcessed');

const defaults = {
  rootValue: 10,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ["*"],
  mediaQuery: false,
  minRemValue: 0,
  exclude: null
};

function createRemReplace(rootValue, unitPrecision, minRemValue) {
  return (m, $1) => {
    if (!$1) return m;
    const rems = parseFloat($1);
    if (rems < minRemValue) return m;
    const remAdjusted = (rems * (16 / rootValue));
    const fixedVal = toFixed(remAdjusted, unitPrecision);
    return fixedVal === 0 ? "0" : fixedVal + "rem";
  };
}

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

function declarationExists(decls, prop, value) {
  return decls.some(decl => decl.prop === prop && decl.value === value);
}

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== "string") return;
  return blacklist.some(regex => {
    if (typeof regex === "string") {
      return selector.indexOf(regex) !== -1;
    }
    return selector.match(regex);
  });
}

function createPropListMatcher(propList) {
  const hasWild = propList.indexOf("*") > -1;
  const matchAll = hasWild && propList.length === 1;
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList)
  };
  return prop => {
    if (matchAll) return true;
    return (
      (hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some(function(m) {
          return prop.indexOf(m) > -1;
        }) ||
        lists.startWith.some(function(m) {
          return prop.indexOf(m) === 0;
        }) ||
        lists.endWith.some(function(m) {
          return prop.indexOf(m) === prop.length - m.length;
        })) &&
      !(
        lists.notExact.indexOf(prop) > -1 ||
        lists.notContain.some(function(m) {
          return prop.indexOf(m) > -1;
        }) ||
        lists.notStartWith.some(function(m) {
          return prop.indexOf(m) === 0;
        }) ||
        lists.notEndWith.some(function(m) {
          return prop.indexOf(m) === prop.length - m.length;
        })
      )
    );
  };
}

module.exports = (options = {}) => {
  const opts = Object.assign({}, defaults, options);
  const satisfyPropList = createPropListMatcher(opts.propList);
  const exclude = opts.exclude;
  let isExcludeFile = false;
  let remReplace;
  return {
    postcssPlugin: "postcss-remtorem",
    Once(css) {
      const filePath = css.source.input.file;
      if (
        exclude &&
        ((type.isFunction(exclude) && exclude(filePath)) ||
          (type.isString(exclude) && filePath.indexOf(exclude) !== -1) ||
          filePath.match(exclude) !== null)
      ) {
        isExcludeFile = true;
      } else {
        isExcludeFile = false;
      }

      const rootValue =
        typeof opts.rootValue === "function"
          ? opts.rootValue(css.source.input)
          : opts.rootValue;
      remReplace = createRemReplace(
        rootValue,
        opts.unitPrecision,
        opts.minRemValue
      );
    },
    Declaration(decl) {
      if (isExcludeFile) return;
      if (decl[remDeclProcessed] === true) return;
      decl[remDeclProcessed] = true

      if (
        decl.value.indexOf("rem") === -1 ||
        !satisfyPropList(decl.prop) ||
        blacklistedSelector(opts.selectorBlackList, decl.parent.selector)
      ) {
        return;
      }

      const value = decl.value.replace(remRegex, remReplace);

      // if rem unit already exists, do not add or replace
      if (declarationExists(decl.parent, decl.prop, value)) return;
      decl.value = value;
    },

    AtRule(atRule) {
      if (isExcludeFile) return;

      if (opts.mediaQuery && atRule.name === "media") {
        if (atRule.params.indexOf("rem") === -1) return;
        atRule.params = atRule.params.replace(remRegex, remReplace);
      }
    }
  };
};
module.exports.postcss = true;

'use strict';

module.exports = function entry(src) {
  if (this && this.cacheable) {
    this.cacheable();
  }

  return [
    'var __ReactStyle = require("react-style");',
    '__ReactStyle.setForceUseClasses(true);',
    src,
    'module.exports = [[module.id, "", ""]];',
    '__ReactStyle.compile(__ReactStyle.maxOverridesLength, "http://gen.reactstyle/fixme.css", function(err, __ReactStyle_result) {',
    '  // FIXME: error handling',
    '  var CleanCSS = require("clean-css");',
    '  var postcss = require("postcss");',
    '  var autoprefixer = require("autoprefixer");',
    '  var prefixer = postcss([ autoprefixer ]);',
    '  module.exports = [[module.id, new CleanCSS().minify(prefixer.process(__ReactStyle_result.css).css).styles, ""]];',
    '  module.exports.__classNames = __ReactStyle_result.classNames;',
    '});'
  ].join('\n');
};

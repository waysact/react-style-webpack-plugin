'use strict';

module.exports = function entry(src) {
  if (this && this.cacheable) {
    this.cacheable();
  }
  return [
    'var __ReactStyle = require("react-style");',
    '__ReactStyle.setForceUseClasses(true);',
    src,
    'var __ReactStyle_result = __ReactStyle.compile(__ReactStyle.maxOverridesLength);',
    'var CleanCSS = require("clean-css");',
    'module.exports = [[module.id, new CleanCSS().minify(__ReactStyle_result.css).styles, ""]];',
    'module.exports.__classNames = __ReactStyle_result.classNames;'
  ].join('\n');
};

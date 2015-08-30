'use strict';

var loaderUtils = require("loader-utils");
var path   = require('path');
var recast = require('recast');

var annotateStyleName = require('./annotateStyleName');
var ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
var RequestShortener = require("webpack/lib/RequestShortener");
var sourceMap = require('source-map');
var ReactStylePlugin = require('./index');

function findPlugin(compiler) {
  if (compiler) {
    for (var i=0; i < compiler.options.plugins.length; ++i) {
      var plugin = compiler.options.plugins[i];
      if (plugin instanceof ReactStylePlugin) {
        return plugin;
      }
    }
  }
  return null;
}

module.exports = function annotate(src, inputMap) {
  if (this && this.cacheable) {
    this.cacheable();
  }

  var map;
  if (/StyleSheet\.create/.exec(src)) {

    var publicPath;
    if (this.options) {
      var relative = path.relative(this.options.context, this.resourcePath);
      var template = this.options.output.devtoolModuleFilenameTemplate;
      if (template) {
        var requestShortener = new RequestShortener(this._compiler.context);
        publicPath = ModuleFilenameHelpers.createFilename(relative, template, requestShortener);
      }
      else {
        publicPath = relative;
      }
    } else {
      publicPath = this.resourcePath;
    }

    var tree   = recast.parse(src, { sourceFileName: this.resourcePath });
    var prefix = path.basename(this.resourcePath).split('.')[0];
    var query = {};
    if (this.query) {
      query = loaderUtils.parseQuery(this.query);
    }

    var mapping;
    var plugin = findPlugin(this._compiler);
    if (plugin) {
      mapping = plugin.styleNameMapping;
    } else {
      mapping = {}
    }

    tree = annotateStyleName(tree, prefix, query, publicPath, this.resourcePath, mapping);
    var result = recast.print(tree, { sourceMapName: this.resourcePath });

    map = result.map;
    map.file = this.resourcePath;
    map.sources = [ this.resourcePath ];

    if (inputMap) {
      map.sources = [ inputMap.file ];

      var inputMapConsumer = new sourceMap.SourceMapConsumer(inputMap);
      var outputMapConsumer = new sourceMap.SourceMapConsumer(map);
      var outputMapGenerator = sourceMap.SourceMapGenerator.fromSourceMap(outputMapConsumer);
      outputMapGenerator.applySourceMap(inputMapConsumer);
      map = outputMapGenerator.toJSON();
    }

    src = result.code;
  } else {
    map = inputMap;
  }
  this.callback(null, src, map);
};

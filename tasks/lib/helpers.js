/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt-contrib-watch/blob/master/LICENSE-MIT
 */

exports.init = function(grunt) {
  'use strict';

  var exports = {};

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  // Helper for normalizing watch config object
  exports.normalizeConfig = function normalizeConfig(data, target) {
    var ret = {tasks:[], src:[], options:{}};
    if (target) {
      if (!data[target]) {
        grunt.warn('Could not find config data for the "' + target + '" target.');
        return false;
      }
      data = data[target];
    }
    Object.keys(data).forEach(function(key) {
      if (key === 'options' && Object.keys(ret.options).length < 1) {
        return !!(ret.options = data[key]);
      }
      if (key === 'tasks' && ret.tasks.length < 1) {
        return !!(ret.tasks = (typeof data[key] === 'string') ? [data[key]] : data[key]);
      }
      if ((key === 'files' || key === 'src') && ret.src < 1) {
        return !!(ret.src = (typeof data[key] === 'string') ? [data[key]] : data[key]);
      }
      if (grunt.util.kindOf(data[key]) === 'object') {
        ret = normalizeConfig(data[key]);
      }
    });
    if (ret.src) {
      ret.src = grunt.util._.flatten(grunt.util.recurse(ret.src, function(file) {
        if (typeof file !== 'string') { return file; }
        return grunt.template.process(file);
      }));
    }
    return ret;
  };

  return exports;
};

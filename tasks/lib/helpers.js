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

  var path = require('path');

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

  // Helper for spawning tasks as child processes
  exports.spawn = function spawn(opts, done) {
    // Find the grunt bin command
    opts.cmd = path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'grunt');
    if (process.platform === 'win32') { opts.cmd += '.cmd'; }
    // Append on passed args
    opts.args = grunt.util._.chain(opts.args)
      .union([].slice.call(process.argv, 3))
      .without('watch')
      .value();
    // Set the base if it has not been specified
    if (grunt.util._.indexOf(opts.args, '--base') === -1) {
      opts.args.push('--base', process.cwd());
    }
    // Set the gruntfile if it has not been specified
    var cfgName = '--config';
    var gruntfile = 'grunt.js';
    if (String(grunt.version).slice(0, 3) === '0.4') {
      cfgName = '--gruntfile';
      gruntfile = 'Gruntfile.js';
    }
    if (grunt.util._.indexOf(opts.args, cfgName) === -1) {
      opts.args.push(cfgName, path.resolve(process.cwd(), gruntfile));
    }
    // Spawn the tasks
    grunt.util.spawn(opts, done);
  };

  return exports;
};

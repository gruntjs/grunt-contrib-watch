/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var path = require('path');
  var gaze = require('gaze');

  // Find the grunt bin
  var gruntBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'grunt');
  if (process.platform === 'win32') { gruntBin += '.cmd'; }

  grunt.registerTask('watch', 'Run predefined tasks whenever watched files change.', function(target) {
    this.requiresConfig('watch');
    var helpers = require('./lib/helpers.js').init(grunt);
    var config = helpers.normalizeConfig(grunt.config('watch'), target || this.target);
    // Message to display when waiting for changes
    var waiting = 'Waiting...';
    // File changes to be logged.
    var changedFiles = Object.create(null);
    // List of changed / deleted file paths.
    grunt.file.watchFiles = {changed: [], deleted: [], added: []};

    grunt.verbose.writeflags(config.options, 'Options');

    if (config.tasks.length < 1) {
      grunt.log.error('Please specify tasks in your config.');
      return false;
    }

    // Call to close this task
    var done = this.async();

    // Run the tasks for the changed files
    var runTasks = grunt.util._.debounce(function runTasks() {
      grunt.log.ok();
      Object.keys(changedFiles).forEach(function(filepath) {
        var status = changedFiles[filepath];
        // Log which file has changed, and how.
        grunt.log.ok('File "' + filepath + '" ' + status + '.');
        // Add filepath to grunt.file.watchFiles for grunt.file.expand* methods.
        grunt.file.watchFiles[status].push(filepath);
      });
      changedFiles = Object.create(null);
      // Spawn the tasks as a child process
      grunt.util.spawn({
        cmd: gruntBin,
        opts: {cwd: process.cwd()},
        args: grunt.util._.union(config.tasks, [].slice.call(process.argv, 3))
      }, function(err, res, code) {
        if (code !== 0) { grunt.log.error(res.stderr); }
        grunt.log.writeln(res.stdout).writeln('').write(waiting);
      });
    }, 250);

    // Start up watcher
    gaze(config.src, config.options, function(err) {
      if (err) {
        grunt.log.error(err.message);
        return done();
      }
      grunt.log.write(waiting);
      // On changed/added/deleted
      this.on('all', function(status, filepath) {
        filepath = path.relative(process.cwd(), filepath);
        changedFiles[filepath] = status;
        runTasks();
      });
      // On watcher error
      this.on('error', function(err) { grunt.log.error(err); });
    });

    // Keep the process alive
    setInterval(function() {}, 250);
  });
};

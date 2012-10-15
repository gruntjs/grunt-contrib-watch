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
  var Gaze = require('gaze').Gaze;

  // Find the grunt bin
  var gruntBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'grunt');
  if (process.platform === 'win32') { gruntBin += '.cmd'; }

  grunt.registerTask('watch', 'Run predefined tasks whenever watched files change.', function(target) {
    this.requiresConfig('watch');
    // Build an array of files/tasks objects
    var watch = grunt.config('watch');
    var targets = target ? [target] : Object.keys(watch).filter(function(key) {
      return typeof watch[key] !== 'string' && !Array.isArray(watch[key]);
    });
    targets = targets.map(function(target) {
      // Fail if any required config properties have been omitted
      target = ['watch', target];
      this.requiresConfig(target.concat('files'), target.concat('tasks'));
      return grunt.config(target);
    }, this);

    // Allow "basic" non-target format
    if (typeof watch.files === 'string' || Array.isArray(watch.files)) {
      targets.push({files: watch.files, tasks: watch.tasks});
    }

    // Get a list of files to be watched
    var patterns = grunt.util._.chain(targets).pluck('files').flatten().uniq().value();
    // Message to display when waiting for changes
    var waiting = 'Waiting...';
    // File changes to be logged.
    var changedFiles = Object.create(null);
    // List of changed / deleted file paths.
    grunt.file.watchFiles = {changed: [], deleted: [], added: []};

    // Call to close this task
    var done = this.async();
    grunt.log.write(waiting);

    // Run the tasks for the changed files
    var runTasks = grunt.util._.debounce(function runTasks(tasks) {
      grunt.log.ok();
      var fileArray = Object.keys(changedFiles);
      fileArray.forEach(function(filepath) {
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
        args: grunt.util._.union(tasks, [].slice.call(process.argv, 3))
      }, function(err, res, code) {
        if (code !== 0) { grunt.log.error(res.stderr); }
        grunt.log.writeln(res.stdout).writeln('').write(waiting);
      });
    }, 250);

    targets.forEach(function(target) {
      if (typeof target.files === 'string') {
        target.files = [target.files];
      }
      var patterns = grunt.util._.chain(target.files).flatten().uniq().value();
      var options = target.options || {};
      var gaze = new Gaze(patterns, options, function(err) {
        if (err) {
          grunt.log.error(err.message);
          return done();
        }
        // On changed/added/deleted
        this.on('all', function(status, filepath) {
          filepath = path.relative(process.cwd(), filepath);
          changedFiles[filepath] = status;
          runTasks(target.tasks);
        });
        // On watcher error
        this.on('error', function(err) { grunt.log.error(err); });
      });
    });

    // Keep the process alive
    setInterval(function() {}, 250);
  });
};

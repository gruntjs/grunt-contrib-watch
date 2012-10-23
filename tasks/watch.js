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
  var fs = require('fs');
  var Gaze = require('gaze').Gaze;

  // In Nodejs 0.8.0, existsSync moved from path -> fs.
  // TODO: When 0.4 is release, use grunt.file.exists
  fs.existsSync = fs.existsSync || path.existsSync;

  // Default options for the watch task
  var defaults = {
    interrupt: false
  };

  // Find the grunt bin
  var gruntBin = grunt.util._.find([
    process.argv[1],
    path.resolve(process.cwd(), 'node_modules', '.bin', 'grunt'),
    path.resolve(path.dirname(process.execPath), 'grunt'),
    path.resolve(__dirname, '..', 'node_modules', '.bin', 'grunt'),
  ], function(bin) {
    return fs.existsSync(bin);
  });
  if (process.platform === 'win32') { gruntBin += '.cmd'; }
  if (!fs.existsSync(gruntBin)) {
    grunt.fatal('The Grunt binary could not be found. Please install grunt first with: npm install grunt');
  }

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

    // Message to display when waiting for changes
    var waiting = 'Waiting...';
    // File changes to be logged.
    var changedFiles = Object.create(null);
    // Keep track of spawns per tasks
    var spawned = Object.create(null);
    // List of changed / deleted file paths.
    grunt.file.watchFiles = {changed: [], deleted: [], added: []};

    // Call to close this task
    var done = this.async();
    grunt.log.write(waiting);

    // Run the tasks for the changed files
    var runTasks = grunt.util._.debounce(function runTasks(i, tasks, options) {
      // If interrupted, reset the spawned for a target
      if (options.interrupt && typeof spawned[i] === 'object') {
        grunt.log.writeln('').write('Previously spawned task has been interrupted...'.yellow);
        spawned[i].kill('SIGINT');
        delete spawned[i];
      }
      // Only spawn one at a time unless interrupt is specified
      if (!spawned[i]) {
        grunt.log.ok();
        var fileArray = Object.keys(changedFiles);
        fileArray.forEach(function(filepath) {
          var status = changedFiles[filepath];
          // Log which file has changed, and how.
          grunt.log.ok('File "' + filepath + '" ' + status + '.');
          // Add filepath to grunt.file.watchFiles for grunt.file.expand* methods.
          grunt.file.watchFiles[status].push(filepath);
        });
        // Reset changedFiles
        changedFiles = Object.create(null);
        // Spawn the tasks as a child process
        spawned[i] = grunt.util.spawn({
          cmd: gruntBin,
          opts: {cwd: process.cwd()},
          args: grunt.util._.union(tasks, [].slice.call(process.argv, 3))
        }, function(err, res, code) {
          // Spawn is done
          delete spawned[i];
          grunt.log.writeln('').write(waiting);
        });
        // Display stdout/stderr immediately
        spawned[i].stdout.on('data', function(buf) { grunt.log.write(String(buf)); });
        spawned[i].stderr.on('data', function(buf) { grunt.log.error(String(buf)); });
      }
    }, 250);

    targets.forEach(function(target, i) {
      if (typeof target.files === 'string') {
        target.files = [target.files];
      }
      // Get patterns to glob for this target
      var patterns = grunt.util._.chain(target.files).flatten().uniq().value();
      // Default options per target
      var options = grunt.util._.defaults(target.options || {}, defaults);
      // Create watcher per target
      var gaze = new Gaze(patterns, options, function(err) {
        if (err) {
          grunt.log.error(err.message);
          return done();
        }
        // On changed/added/deleted
        this.on('all', function(status, filepath) {
          filepath = path.relative(process.cwd(), filepath);
          changedFiles[filepath] = status;
          runTasks(i, target.tasks, options);
        });
        // On watcher error
        this.on('error', function(err) { grunt.log.error(err); });
      });
    });

    // Keep the process alive
    setInterval(function() {}, 250);
  });
};

/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

var path = require('path');
var chokidar = require('chokidar');
var _ = require('lodash');
var waiting = 'Waiting...';
var changedFiles = Object.create(null);
var watchers = [];

module.exports = function(grunt) {
  'use strict';

  var taskrun = require('./lib/taskrunner')(grunt);

  // Default date format logged
  var dateFormat = function(time) {
    grunt.log.writeln(String(
      'Completed in ' +
      time.toFixed(3) +
      's at ' +
      (new Date()).toString()
    ).cyan + ' - ' + waiting);
  };

  // When task runner has started
  taskrun.on('start', function() {
    Object.keys(changedFiles).forEach(function(filepath) {
      // Log which file has changed, and how.
      var action = {
        add: 'added',
        addDir: 'added',
        unlink: 'deleted',
        unlinkDir: 'deleted',
        change: 'changed'
      };
      grunt.log.ok('File "' + filepath + '" ' + action[changedFiles[filepath]] + '.');
    });
    // Reset changedFiles
    changedFiles = Object.create(null);
  });

  // When task runner has ended
  taskrun.on('end', function(time) {
    if (time > 0) {
      dateFormat(time);
    }
  });

  // When a task run has been interrupted
  taskrun.on('interrupt', function() {
    grunt.log.writeln('').write('Scheduled tasks have been interrupted...'.yellow);
  });

  // When taskrun is reloaded
  taskrun.on('reload', function() {
    taskrun.clearRequireCache(Object.keys(changedFiles));
    grunt.log.writeln('').writeln('Reloading watch config...'.cyan);
  });

  grunt.registerTask('chokidar', 'Run predefined tasks whenever watched files change.', function(target) {
    var self = this;
    var name = self.name || 'chokidar';

    // Close any previously opened watchers
    watchers.forEach(function(watcher) {
      watcher.close();
    });
    watchers = [];

    // Never gonna give you up, never gonna let you down
    if (grunt.config([name, 'options', 'forever']) !== false) {
      taskrun.forever();
    }

    // If a custom dateFormat function
    var df = grunt.config([name, 'options', 'dateFormat']);
    if (typeof df === 'function') {
      dateFormat = df;
    }

    if (taskrun.running === false) { grunt.log.writeln(waiting); }

    // initialize taskrun
    var targets = taskrun.init(name, {target: target});

    targets.forEach(function(target) {
      if (typeof target.files === 'string') { target.files = [target.files]; }

      // Process into raw patterns
      var patterns = _.chain(target.files).flatten().map(function(pattern) {
        return grunt.config.process(pattern);
      }).value();

      // Validate the event option
      if (typeof target.options.event === 'string') {
        target.options.event = [target.options.event];
      }

      var eventCwd = process.cwd();
      if (target.options.cwd && target.options.cwd.event) {
        eventCwd = target.options.cwd.event;
      }

      // Set cwd if options.cwd.file is set
      if (typeof target.options.cwd !== 'string' && target.options.cwd.files) {
        target.options.cwd = target.options.cwd.files;
      }

      // Create watcher per target
      var watcher = chokidar.watch(patterns, _.defaults({}, target.options, {
        ignoreInitial: true
      }));

      watcher.on('all', function(event, filepath) {
        // Skip events not specified
        if (!_.contains(target.options.event, 'all') && !_.contains(target.options.event, event)) {
          return;
        }

        filepath = path.relative(eventCwd, filepath);

        // Skip empty filepaths
        if (filepath === '') {
          return;
        }

        // If Gruntfile.js changed, reload self task
        if (target.options.reload || /gruntfile\.(js|coffee)/i.test(filepath)) {
          taskrun.reload = true;
        }

        // Emit watch events if anyone is listening
        if (grunt.event.listeners('chokidar').length > 0) {
          grunt.event.emit('chokidar', event, filepath, target.name);
        }

        // Group changed files only for display
        changedFiles[filepath] = event;

        // Add changed files to the target
        if (taskrun.targets[target.name]) {
          if (!taskrun.targets[target.name].changedFiles) {
            taskrun.targets[target.name].changedFiles = Object.create(null);
          }
          taskrun.targets[target.name].changedFiles[filepath] = event;
        }

        // Queue the target
        if (taskrun.queue.indexOf(target.name) === -1) {
          taskrun.queue.push(target.name);
        }

        // Run the tasks
        taskrun.run();
      });
      watcher.on('error', function(err) {
        if (typeof err === 'string') {
          err = new Error(err);
        }
        grunt.log.error(err.message);
      });

      watchers.push(watcher);
    });

  });
};

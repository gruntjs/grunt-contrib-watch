/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var Gaze = require('gaze').Gaze;
  var taskrun = require('./lib/taskrun');

  // Default options for the watch task
  var defaults = {
    interrupt: false,
    nospawn: false
  };

  grunt.registerTask('watch', 'Run predefined tasks whenever watched files change.', function(target) {
    var name = this.name || 'watch';
    this.requiresConfig(name);

    // Build an array of files/tasks objects
    var watch = grunt.config(name);
    var targets = target ? [target] : Object.keys(watch).filter(function(key) {
      return typeof watch[key] !== 'string' && !Array.isArray(watch[key]);
    });

    targets = targets.map(function(target) {
      // Fail if any required config properties have been omitted
      target = [name, target];
      this.requiresConfig(target.concat('files'), target.concat('tasks'));
      return grunt.config(target);
    }, this);

    // Allow "basic" non-target format
    if (typeof watch.files === 'string' || Array.isArray(watch.files)) {
      targets.push({files: watch.files, tasks: watch.tasks});
    }

    // This task's name + optional args, in string format.
    taskrun.nameArgs = this.nameArgs;

    // Get process.argv options without grunt.cli.tasks to pass to child processes
    taskrun.cliArgs = grunt.util._.without.apply(null, [[].slice.call(process.argv, 2)].concat(grunt.cli.tasks));

    // Call to close this task
    var done = this.async();
    if (taskrun.startedAt !== false) {
      taskrun.completed();
    } else {
      grunt.log.write(taskrun.waiting);
    }

    targets.forEach(function(target, i) {
      if (typeof target.files === 'string') {
        target.files = [target.files];
      }

      // Process into raw patterns
      var patterns = grunt.util._.chain(target.files).flatten().map(function(pattern) {
        return grunt.config.process(pattern);
      }).value();

      // Default options per target
      var options = grunt.util._.defaults(target.options || {}, defaults);

      // Create watcher per target
      new Gaze(patterns, options, function(err) {
        if (err) {
          grunt.log.error(err.message);
          return done();
        }

        // On changed/added/deleted
        this.on('all', function(status, filepath) {
          filepath = path.relative(process.cwd(), filepath);
          taskrun.changedFiles[filepath] = status;
          taskrun[options.nospawn ? 'nospawn' : 'spawn'](i, target.tasks, options, done);
        });

        // On watcher error
        this.on('error', function(err) { grunt.log.error(err); });
      });
    });

    // Keep the process alive
    setInterval(function() {}, 250);
  });
};

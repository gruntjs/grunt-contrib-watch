/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var EE = require('events').EventEmitter;
var util = require('util');

module.exports = function(grunt) {

  // Create a TaskRun on a target
  function TaskRun(target, defaults) {
    this.name = target.name || 0;
    this.files = target.files || [];
    this.tasks = target.tasks || [];
    this.options = grunt.util._.defaults(target.options || {}, defaults);
    this.startedAt = false;
    this.spawned = null;
  }

  // Run it
  TaskRun.prototype.run = function(done) {
    var self = this;

    // Dont run if already running
    if (self.startedAt !== false) { return; }

    self.startedAt = Date.now();
    if (self.options.nospawn === true) {
      grunt.task.run(self.tasks);
      done();
    } else {
      self.spawned = grunt.util.spawn({
        // Spawn with the grunt bin
        grunt: true,
        // Run from current working dir and inherit stdio from process
        opts: {
          cwd: self.options.cwd,
          stdio: 'inherit',
        },
        // Run grunt this process uses, append the task to be run and any cli options
        args: self.tasks.concat(self.options.cliArgs || [])
      }, function(err, res, code) {
        // Spawn is done
        self.spawned = null;
        done();
      });
    }
  };

  // When the task has completed
  TaskRun.prototype.complete = function() {
    var time = this.startedAt;
    this.startedAt = false;
    if (this.spawned) {
      this.spawned.kill('SIGINT');
      this.spawned = null;
    }
    return time;
  };

  return TaskRun;
};

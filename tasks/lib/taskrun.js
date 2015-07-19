/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var EE = require('events').EventEmitter;
var util = require('util');
var spawn = require('child_process').spawn;

module.exports = function(grunt) {

  var livereload = require('./livereload')(grunt);

  // Create a TaskRun on a target
  function TaskRun(target) {
    this.name = target.name || 0;
    this.files = target.files || [];
    this._getConfig = target._getConfig;
    this.options = target.options;
    this.startedAt = false;
    this.spawned = null;
    this.changedFiles = Object.create(null);
    this.spawnTaskFailure = false;
    this.livereloadOnError = true;
    if (typeof this.options.livereloadOnError !== 'undefined') {
      this.livereloadOnError = this.options.livereloadOnError;
    }
  }

  var getErrorCount = function() {
    if (typeof grunt.fail.forever_warncount !== 'undefined') {
      return grunt.fail.forever_warncount + grunt.fail.forever_errorcount;
    } else {
      return grunt.fail.warncount + grunt.fail.errorcount;
    }
  };

  // Run it
  TaskRun.prototype.run = function(done) {
    var self = this;

    // Dont run if already running
    if (self.startedAt !== false) { return; }

    // Start this task run
    self.startedAt = Date.now();

    // reset before each run
    self.spawnTaskFailure = false;
    self.errorsAndWarningsCount = getErrorCount();

    // pull the tasks here in case they were changed by a watch event listener
    self.tasks = self._getConfig('tasks') || [];
    if (typeof self.tasks === 'string') {
      self.tasks = [self.tasks];
    }

    // If no tasks just call done to trigger potential livereload
    if (self.tasks.length < 1) { return done(); }

    if (self.options.spawn === false || self.options.nospawn === true) {
      grunt.task.run(self.tasks);
      done();
    } else {
      var cmd = process.execPath;
      var args = process.execArgv.concat(process.argv[1]);
      args = args.concat(self.tasks.concat(self.options.cliArgs || []));
      var child = self.spawned = spawn(cmd, args, {
        cwd: self.options.cwd.spawn,
        stdio: 'inherit'
      });
      child.on('close', function(code, signal) {
        self.spawnTaskFailure = (code !== 0);
        if (self.options.interrupt !== true || (code !== 130 && code !== 1 && signal !== 'SIGINT')) {
          // Spawn is done
          self.spawned = null;
          done();
        }
      });
    }
  };

  // When the task run has completed
  TaskRun.prototype.complete = function() {
    var time = Date.now() - this.startedAt;
    this.startedAt = false;
    if (this.spawned) {
      this.spawned.kill('SIGINT');
      this.spawned = null;
    }

    var taskFailed = this.spawnTaskFailure || (getErrorCount() > this.errorsAndWarningsCount);
    this.errorsAndWarningsCount = getErrorCount();

    // Trigger livereload if necessary
    if (this.livereload && (this.livereloadOnError || !taskFailed)) {
      this.livereload.trigger(Object.keys(this.changedFiles));
      this.changedFiles = Object.create(null);
    }
    return time;
  };

  return TaskRun;
};

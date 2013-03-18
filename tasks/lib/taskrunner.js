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

// Track which targets to run after reload
var reloadTargets = [];

module.exports = function(grunt) {

  var TaskRun = require('./taskrun')(grunt);

  function Runner() {
    EE.call(this);
    // Name of the task
    this.name = 'watch';
    // Options for the runner
    this.options = {};
    // Function to close the task
    this.done = function() {};
    // Targets available to task run
    this._targets = Object.create(null);
    // The queue of task runs
    this._queue = [];
    // Whether we're actively running tasks
    this.running = false;
    // If a nospawn task has ran (and needs the watch to restart)
    this.nospawn = false;
    // Set to true before run() to reload task
    this.reload = false;
    // For re-queuing arguments with the task that originally ran this
    this.nameArgs = [];
  }
  util.inherits(Runner, EE);

  // Init a task for taskrun
  Runner.prototype.init = function(name, defaults, done) {
    var self = this;

    self.name = name || grunt.task.current.name || 'watch';
    self.options = grunt.task.current.options(defaults || {}, {
      // The cwd to spawn within
      cwd: process.cwd(),
      // Additional cli args to append when spawning
      cliArgs: grunt.util._.without.apply(null, [[].slice.call(process.argv, 2)].concat(grunt.cli.tasks)),
    });
    self.reload = false;
    self.nameArgs = (grunt.task.current.nameArgs) ? grunt.task.current.nameArgs : self.name;

    // Function to call when closing the task
    self.done = done || grunt.task.current.async();

    if (self.running) {
      // If previously running, complete the last run
      self.complete();
    } else if (reloadTargets.length > 0) {
      // If not previously running but has items in the queue, needs run
      self._queue = reloadTargets;
      reloadTargets = [];
      self.run();
    }

    // Return the targets normalized
    return self._getTargets(self.name);
  };

  // Normalize targets from config
  Runner.prototype._getTargets = function(name) {
    var self = this;

    grunt.task.current.requiresConfig(name);
    var config = grunt.config(name);

    var targets = Object.keys(config).filter(function(key) {
      if (key === 'options') { return false; }
      return typeof config[key] !== 'string' && !Array.isArray(config[key]);
    }).map(function(target) {
      // Fail if any required config properties have been omitted
      grunt.task.current.requiresConfig([name, target, 'files']);
      var cfg = grunt.config([name, target]);
      cfg.name = target;
      self.add(cfg);
      return cfg;
    }, self);

    // Allow "basic" non-target format
    if (typeof config.files === 'string' || Array.isArray(config.files)) {
      targets.push({files: config.files, tasks: config.tasks, target: 0});
    }

    return targets;
  };

  // Run the current queue of task runs
  Runner.prototype.run = grunt.util._.debounce(function() {
    var self = this;
    if (self._queue.length < 1) {
      self.running = false;
      return;
    }

    // If we should interrupt
    if (self.running === true) {
      if (self.options.interrupt === true) {
        self.interrupt();
      } else {
        // Dont interrupt the tasks running
        return;
      }
    }

    // If we should reload
    if (self.reload) { return self.reloadTask(); }

    // Trigger that tasks runs have started
    self.emit('start');
    self.running = true;

    // Run each target
    var shouldComplete = true;
    grunt.util.async.forEachSeries(self._queue, function(name, next) {
      var tr = self._targets[name];
      if (!tr) { return next(); }
      if (tr.options.nospawn) { shouldComplete = false; }
      tr.run(next);
    }, function() {
      if (shouldComplete) {
        self.complete();
      } else {
        grunt.task.mark().run(self.nameArgs);
        self.done();
      }
    });
  }, 250);

  // Queue target names for running
  Runner.prototype.queue = function(names) {
    var self = this;
    if (typeof names === 'string') { names = [names]; }
    names.forEach(function(name) {
      if (self._queue.indexOf(name) === -1) {
        self._queue.push(name);
      }
    });
    return self._queue;
  };

  // Push targets onto the queue
  Runner.prototype.add = function add(target) {
    if (!this._targets[target.name || 0]) {
      var tr = new TaskRun(target, this.options);
      return this._targets[tr.name] = tr;
    }
    return false;
  };

  // Do this when queued task runs have completed/scheduled
  Runner.prototype.complete = function complete() {
    var self = this;
    if (self.running === false) { return; }
    self.running = false;
    var time = 0;
    self._queue.forEach(function(name, i) {
      var target = self._targets[name];
      if (!target) { return; }
      if (target.startedAt !== false) {
        time += target.complete();
        self._queue[i] = null;
      }
    });
    var elapsed = (time > 0) ? Number((Date.now() - time) / 1000) : 0;
    self.emit('end', elapsed);
  };

  // Run through completing every target in the queue
  Runner.prototype._completeQueue = function() {
    var self = this;
    self._queue.forEach(function(name) {
      var target = self._targets[name];
      if (!target) { return; }
      target.complete();
    });
  };

  // Interrupt the running tasks
  Runner.prototype.interrupt = function interrupt() {
    var self = this;
    self._completeQueue();
    grunt.task.clearQueue();
    self.emit('interrupt');
  };

  // Make this task run forever
  Runner.prototype.forever = function() {
    process.exit = function() {};
    grunt.fail.report = function() {};
  };

  // Clear the require cache for all passed filepaths.
  Runner.prototype.clearRequireCache = function() {
    // If a non-string argument is passed, it's an array of filepaths, otherwise
    // each filepath is passed individually.
    var filepaths = typeof arguments[0] !== 'string' ? arguments[0] : grunt.util.toArray(arguments);
    // For each filepath, clear the require cache, if necessary.
    filepaths.forEach(function(filepath) {
      var abspath = path.resolve(filepath);
      if (require.cache[abspath]) {
        grunt.verbose.write('Clearing require cache for "' + filepath + '" file...').ok();
        delete require.cache[abspath];
      }
    });
  };

  // Reload this watch task, like when a Gruntfile is edited
  Runner.prototype.reloadTask = function() {
    var self = this;
    // Which targets to run after reload
    reloadTargets = self._queue;
    self.emit('reload', reloadTargets);

    // Re-init the watch task config
    grunt.task.init([self.name]);

    // Complete all running tasks
    self._completeQueue();

    // Run the watch task again
    grunt.task.run(self.nameArgs);
    self.done();
  };

  return new Runner();
};

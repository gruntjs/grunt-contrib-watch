'use strict';

var grunt = require('grunt');
var path = require('path');
grunt.util = grunt.util || grunt.utils;

// In case the grunt being used to test is different than the grunt being
// tested, initialize the task and config subsystems.
if (grunt.task.searchDirs.length === 0) {
  grunt.task.init([]);
  grunt.config.init({});
}

// Where our fixtures are
var fixtures = path.join(__dirname, '..', 'fixtures');

// helper for creating assertTasks for testing tasks in child processes
function assertTask(task, options) {
  var spawn = require('child_process').spawn;
  task = task || 'default';
  options = options || {};

  // get grunt command
  var gruntBin = path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'grunt');
  if (process.platform === 'win32') { gruntBin += '.cmd'; }

  // get next/kill process trigger
  var trigger = options.trigger || 'Waiting...';
  delete options.trigger;

  // turn options into spawn options
  var spawnOptions = [];
  grunt.util._.each(options, function(val, key) {
    spawnOptions.push('--' + key);
    spawnOptions.push(val);
  });
  spawnOptions.push(task);

  // Return an interface for testing this task
  function returnFunc(runs, done) {
    var spawnGrunt = spawn(gruntBin, spawnOptions);
    var out = '';

    if (!grunt.util._.isArray(runs)) {
      runs = [runs];
    }

    // Append a last function to kill spawnGrunt
    runs.push(function() { spawnGrunt.kill('SIGINT'); });

    // After watch starts waiting, run our commands then exit
    spawnGrunt.stdout.on('data', function(data) {
      data = grunt.log.uncolor(String(data));
      out += data;

      // If we should run the next function
      var shouldRun = true;

      // If our trigger has been found
      if (trigger !== false) {
        shouldRun = (grunt.util._.indexOf(data.split("\n"), trigger) !== -1);
      }

      // Run the function
      if (shouldRun) {
        setTimeout(function() {
          var run = runs.shift();
          if (typeof run === 'function') { run(); }
        }, 500);
      }
    });

    // Throw errors for better testing
    spawnGrunt.stderr.on('data', function(data) {
      throw new Error(data);
    });

    // On process exit return what has been outputted
    spawnGrunt.on('exit', function() {
      done(out);
    });
  }
  returnFunc.options = options;
  return returnFunc;
}

exports.watchConfig = {
  oneTarget: function(test) {
    test.expect(2);
    var base = path.resolve(fixtures, 'oneTarget');
    var assertWatch = assertTask('watch', {
      trigger: 'Waiting...',
      base: base,
      gruntfile: path.resolve(base, 'Gruntfile.js')
    });
    assertWatch(function() {
      var write = 'var test = true;';
      grunt.file.write(path.join(base, 'lib', 'one.js'), write);
    }, function(result) {
      test.ok(result.indexOf('File "lib/one.js" changed') !== -1, 'Watch should have fired when oneTarget/lib/one.js has changed.');
      test.ok(result.indexOf('I do absolutely nothing.') !== -1, 'echo task should have fired.');
      test.done();
    });
  },
  multiTargetsTriggerOneNotTwo: function(test) {
    test.expect(2);
    var base = path.resolve(fixtures, 'multiTargets');
    var assertWatch = assertTask('watch', {
      trigger: 'Waiting...',
      base: base,
      gruntfile: path.resolve(base, 'Gruntfile.js')
    });
    assertWatch(function() {
      var write = 'var test = true;';
      grunt.file.write(path.join(base, 'lib', 'one.js'), write);
    }, function(result) {
      test.ok(result.indexOf('one has changed') !== -1, 'Only task echo:one should of emit.');
      test.ok(result.indexOf('two has changed') === -1, 'Task echo:two should NOT emit.');
      test.done();
    });
  },
  multiTargetsTriggerBoth: function(test) {
    test.expect(2);
    var base = path.resolve(fixtures, 'multiTargets');
    var assertWatch = assertTask('watch', {
      trigger: 'Waiting...',
      base: base,
      gruntfile: path.resolve(base, 'Gruntfile.js')
    });
    assertWatch(function() {
      var write = 'var test = true;';
      grunt.file.write(path.join(base, 'lib', 'one.js'), write);
      grunt.file.write(path.join(base, 'lib', 'two.js'), write);
    }, function(result) {
      test.ok(result.indexOf('one has changed') !== -1, 'Task echo:one should of emit.');
      test.ok(result.indexOf('two has changed') !== -1, 'Task echo:two should of emit.');
      test.done();
    });
  }
};

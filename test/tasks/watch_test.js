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

  // Find the grunt bin
  var gruntBin = grunt.util._.find([
    path.resolve(process.cwd(), 'node_modules', '.bin', 'grunt'),
    path.resolve(path.dirname(process.execPath), 'grunt'),
    path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'grunt'),
  ], function(bin) {
    return grunt.file.exists(bin);
  });
  if (process.platform === 'win32') { gruntBin += '.cmd'; }
  if (!grunt.file.exists(gruntBin)) {
    grunt.fatal('The Grunt binary could not be found.');
  }

  // get next/kill process trigger
  var trigger = options.trigger || 'Waiting...';
  delete options.trigger;

  // CWD to spawn
  var cwd = options.cwd || process.cwd();
  delete options.cwd;

  // turn options into spawn options
  var spawnOptions = [];
  grunt.util._.each(options, function(val, key) {
    spawnOptions.push('--' + key);
    spawnOptions.push(val);
  });
  spawnOptions.push(task);

  // Return an interface for testing this task
  function returnFunc(runs, done) {
    var spawnGrunt = spawn(gruntBin, spawnOptions, {cwd:cwd});
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
    var cwd = path.resolve(fixtures, 'oneTarget');
    var assertWatch = assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      var write = 'var test = true;';
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), write);
    }, function(result) {
      test.ok(result.indexOf('File "lib/one.js" changed') !== -1, 'Watch should have fired when oneTarget/lib/one.js has changed.');
      test.ok(result.indexOf('I do absolutely nothing.') !== -1, 'echo task should have fired.');
      test.done();
    });
  },
  multiTargetsTriggerOneNotTwo: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      var write = 'var test = true;';
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), write);
    }, function(result) {
      test.ok(result.indexOf('one has changed') !== -1, 'Only task echo:one should of emit.');
      test.ok(result.indexOf('two has changed') === -1, 'Task echo:two should NOT emit.');
      test.done();
    });
  },
  multiTargetsTriggerBoth: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = assertTask('watch', {cwd:cwd});
    assertWatch([function() {
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), 'var test = true;');
    }, function() {
      grunt.file.write(path.join(cwd, 'lib', 'two.js'), 'var test = true;');
    }], function(result) {
      test.ok(result.indexOf('one has changed') !== -1, 'Task echo:one should of emit.');
      test.ok(result.indexOf('two has changed') !== -1, 'Task echo:two should of emit.');
      test.done();
    });
  },
  spawnOneAtATime: function(test) {
    test.expect(1);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      grunt.file.write(path.join(cwd, 'lib', 'wait.js'), 'var wait = false;');
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib', 'wait.js'), 'var wait = true;');
      }, 500);
    }, function(result) {
      test.ok(result.indexOf('I waited 2s') !== -1, 'Task should have waited 2s and only spawned once.');
      test.done();
    });
  },
  interrupt: function(test) {
    test.expect(1);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      grunt.file.write(path.join(cwd, 'lib', 'interrupt.js'), 'var interrupt = false;');
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib', 'interrupt.js'), 'var interrupt = true;');
      }, 500);
    }, function(result) {
      test.ok(result.indexOf('has been interrupted') !== -1, 'Task should have been interrupted.');
      test.done();
    });
  }
};

'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var helper = require('./helper');

var fixtures = helper.fixtures;
var useFixtures = ['multiTargets', 'oneTarget'];

function cleanUp() {
  useFixtures.forEach(function(fixture) {
    helper.cleanUp(fixture + '/node_modules');
  });
}

exports.watchConfig = {
  setUp: function(done) {
    cleanUp();
    useFixtures.forEach(function(fixture) {
      fs.symlinkSync(path.join(__dirname, '../../node_modules'), path.join(fixtures, fixture, 'node_modules'));
    });
    done();
  },
  tearDown: function(done) {
    cleanUp();
    done();
  },
  atBegin: function(test) {
    test.expect(1);
    var cwd = path.resolve(fixtures, 'atBegin');
    var assertWatch = helper.assertTask(['watch', '--debug'], {cwd:cwd});
    assertWatch(function() {
       // noop. Does not modify any watched files.
    }, function(result) {
      helper.verboseLog(result);
      var firstIndex = result.indexOf('one has changed');
      test.ok(firstIndex !== -1, 'Watch should have fired even though no file was changed.');
      test.done();
    });

  },
  oneTarget: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'oneTarget');
    var assertWatch = helper.assertTask(['watch', '--debug'], {cwd:cwd});
    assertWatch(function() {
      var write = 'var test = true;';
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), write);
    }, function(result) {
      helper.verboseLog(result);
      test.ok(result.indexOf('File "lib' + path.sep + 'one.js" changed') !== -1, 'Watch should have fired when oneTarget/lib/one.js has changed.');
      test.ok(result.indexOf('I do absolutely nothing.') !== -1, 'echo task should have fired.');
      test.done();
    });
  },
  multiTargetsTriggerOneNotTwo: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      var write = 'var test = true;';
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), write);
    }, function(result) {
      helper.verboseLog(result);
      test.ok(result.indexOf('one has changed') !== -1, 'Only task echo:one should of emit.');
      test.ok(result.indexOf('two has changed') === -1, 'Task echo:two should NOT emit.');
      test.done();
    });
  },
  multiTargetsSequentialFilesChangeTriggerBoth: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch([function() {
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), 'var test = true;');
    }, function() {
      grunt.file.write(path.join(cwd, 'lib', 'two.js'), 'var test = true;');
    }], function(result) {
      helper.verboseLog(result);
      test.ok(result.indexOf('one has changed') !== -1, 'Task echo:one should of emit.');
      test.ok(result.indexOf('two has changed') !== -1, 'Task echo:two should of emit.');
      test.done();
    });
  },
  multiTargetsSimultaneousFilesChangeTriggerBoth: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch([function() {
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), 'var test = true;');
      grunt.file.write(path.join(cwd, 'lib', 'two.js'), 'var test = true;');
    }], function(result) {
      helper.verboseLog(result);
      test.ok(result.indexOf('one has changed') !== -1, 'Task echo:one should of emit.');
      test.ok(result.indexOf('two has changed') !== -1, 'Task echo:two should of emit.');
      test.done();
    });
  },
  spawnOneAtATime: function(test) {
    test.expect(1);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      grunt.file.write(path.join(cwd, 'lib', 'wait.js'), 'var wait = false;');
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib', 'wait.js'), 'var wait = true;');
      }, 500);
    }, function(result) {
      helper.verboseLog(result);
      test.ok(result.indexOf('I waited 2s') !== -1, 'Task should have waited 2s and only spawned once.');
      test.done();
    });
  },
  interrupt: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      grunt.file.write(path.join(cwd, 'lib', 'interrupt.js'), 'var interrupt = 1;');
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib', 'interrupt.js'), 'var interrupt = 2;');
      }, 1000);
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib', 'interrupt.js'), 'var interrupt = 3;');
      }, 2000);
    }, function(result) {
      helper.verboseLog(result);
      var interruptMatches = result.match(/have been interrupted/g);
      test.ok(interruptMatches && interruptMatches.length === 2, 'Task should have been interrupted 2 times.');
      var unInterruptMatches = result.match(/I want to be interrupted/g);
      test.ok(unInterruptMatches && unInterruptMatches.length === 1, 'Only the last time should be working (without interruption)');
      test.done();
    });
  },
  failingTask: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      grunt.file.write(path.join(cwd, 'lib', 'fail.js'), 'var fail = false;');
    }, function(result) {
      helper.verboseLog(result);
      test.ok(result.toLowerCase().indexOf('fatal') !== -1, 'Task should have been fatal.');
      test.equal(grunt.util._(result).count('Waiting...'), 2, 'Should have displayed "Wating..." twice');
      test.done();
    });
  }
};

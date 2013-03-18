'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var helper = require('./helper');

var fixtures = helper.fixtures;

function cleanUp() {
  helper.cleanUp([
    'multiTargets/node_modules',
    'multiTargets/Gruntfile.js.bak',
  ]);
}

var backupGrunfile;

exports.reloadgruntfile = {
  setUp: function(done) {
    cleanUp();
    fs.symlinkSync(path.join(__dirname, '../../node_modules'), path.join(fixtures, 'multiTargets', 'node_modules'));
    backupGrunfile = grunt.file.read(path.join(fixtures, 'multiTargets', 'Gruntfile.js'));
    grunt.file.write(path.join(fixtures, 'multiTargets', 'Gruntfile.js.bak'), backupGrunfile);
    done();
  },
  tearDown: function(done) {
    grunt.file.write(path.join(fixtures, 'multiTargets', 'Gruntfile.js'), backupGrunfile);
    cleanUp();
    done();
  },
  reloadgruntfile: function(test) {
    //test.expect(3);
    var cwd = path.resolve(fixtures, 'multiTargets');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch([function() {
      // First edit a file and trigger the watch
      var write = 'var one = true;';
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), write);
    }, function() {
      // Second edit the gruntfile
      var gruntfile = String(backupGrunfile).replace("tasks: ['echo:two'],", "tasks: ['echo:one'],");
      grunt.file.write(path.join(cwd, 'Gruntfile.js'), gruntfile);
      // Third trigger the watch
    }], function(result) {
      helper.verboseLog(result);
      /*var count = result.match((new RegExp('Running "watch" task', 'g'))).length;
      test.equal(count, 2, 'Watch should have fired twice.');
      test.ok(result.indexOf('Server is listening...') !== -1, 'server should have been started.');
      test.ok(result.indexOf('Server is talking!') !== -1, 'server should have responded.');*/
      test.done();
    });
  },
};

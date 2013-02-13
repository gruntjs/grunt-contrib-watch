'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var helper = require('./helper');

var fixtures = helper.fixtures;

function cleanUp() {
  helper.cleanUp([
    'nospawn/node_modules'
  ]);
}

exports.nospawn = {
  setUp: function(done) {
    cleanUp();
    fs.symlinkSync(path.join(__dirname, '../../node_modules'), path.join(fixtures, 'nospawn', 'node_modules'));
    done();
  },
  tearDown: function(done) {
    cleanUp();
    done();
  },
  nospawn: function(test) {
    //test.expect(2);
    var cwd = path.resolve(fixtures, 'nospawn');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch(function() {
      var write = 'var one = true;';
      grunt.file.write(path.join(cwd, 'lib', 'one.js'), write);
    }, function(result) {
      helper.verboseLog(result);
      //test.ok(result.indexOf('File "lib' + path.sep + 'one.js" changed') !== -1, 'Watch should have fired when oneTarget/lib/one.js has changed.');
      //test.ok(result.indexOf('I do absolutely nothing.') !== -1, 'echo task should have fired.');
      test.done();
    });
  }
};

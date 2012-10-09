var grunt = require('grunt');
var helpers = require('../../../tasks/lib/helpers').init(grunt);

exports.watch = (function() {
  'use strict';

  var _test = {};

  _test.setUp = function(done) {
    grunt.config.init({
      nodeunit: {
        files: ['test/*_test.js']
      }
    });
    done();
  };

  _test.normalizeConfigBasic = function(test) {
    test.expect(2);
    var result = helpers.normalizeConfig({
      scripts: {
        files: ['*.js', '**/*.css'],
        tasks: ['jshint'],
        options: {interval: 100}
      }
    });
    var expected = {
      tasks: ['jshint'],
      src: ['*.js', '**/*.css'],
      options: {interval:100}
    };
    test.deepEqual(result, expected);

    result = helpers.normalizeConfig({
      files: '*.js',
      tasks: 'jshint'
    });
    expected = {
      tasks: ['jshint'],
      src: ['*.js'],
      options: {}
    };
    test.deepEqual(result, expected);
    test.done();
  };

  _test.normalizeConfigAlt = function(test) {
    test.expect(1);
    var result = helpers.normalizeConfig({
      all: {
        src: '*.js',
        tasks: 'jshint'
      }
    });
    var expected = {
      tasks: ['jshint'],
      src: ['*.js'],
      options: {}
    };
    test.deepEqual(result, expected);
    test.done();
  };

  _test.normalizeConfigTemplates = function(test) {
    test.expect(1);
    var result = helpers.normalizeConfig({
      scripts: {
        files: ['*.js', '<%= nodeunit.files %>'],
        tasks: 'jshint'
      }
    });
    var expected = {
      tasks: ['jshint'],
      src: ['*.js', 'test/*_test.js'],
      options: {}
    };
    test.deepEqual(result, expected);
    test.done();
  };

  _test.normalizeConfigMultiTargets = function(test) {
    test.expect(1);
    var result = helpers.normalizeConfig({
      scripts: {
        src: ['*.js'],
        tasks: 'jshint'
      },
      test: {
        files: ['test/*_test.js'],
        tasks: 'nodeunit'
      }
    }, 'scripts');
    var expected = {
      tasks: ['jshint'],
      src: ['*.js'],
      options: {}
    };
    test.deepEqual(result, expected);
    test.done();
  };

  _test.spawn = function(test) {
    test.expect(2);
    helpers.spawn({args:['lint', '--no-color']}, function(err, res, code) {
      test.equals(code, 0);
      test.ok((res.indexOf('Done, without errors.') !== -1), 'Lint task ran without errors.');
      test.done();
    });
  };

  return _test;
}());

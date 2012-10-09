/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt-contrib-watch/blob/master/LICENSE-MIT
 */

module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: [
        'grunt.js',
        'tasks/**/*.js',
        '<config:nodeunit.tasks>'
      ]
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      }
    },

    // Watch
    watch: {
      scripts: {
        src: ['<config:lint.all>'],
        tasks: ['lint', 'nodeunit']
      }
    },

    // Unit tests.
    nodeunit: {
      tasks: ['test/tasks/**/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Rename test to nodeunit for forward compatibility
  grunt.renameTask('test', 'nodeunit');
  grunt.registerTask('test', ['nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['lint', 'test']);
};

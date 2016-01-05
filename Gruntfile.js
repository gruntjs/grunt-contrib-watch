/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    jscs: {
      src: ['tasks/**/*.js', 'test/tasks/**/*.js'],
      options: {
        config: '.jscsrc'
      }
    },
    watch: {
      all: {
        files: ['<%= jshint.all %>'],
        tasks: ['jshint', 'nodeunit'],
      },
    },
    nodeunit: {
      tests: ['test/tasks/*_test.js'],
    },
  });

  // Dynamic alias task to nodeunit. Run individual tests with: grunt test:events
  grunt.registerTask('test', function(file) {
    grunt.task.run('jshint');
    grunt.task.run('jscs');
    grunt.config('nodeunit.tests', String(grunt.config('nodeunit.tests')).replace('*', file || '*'));
    grunt.task.run('nodeunit');
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask('default', ['test', 'build-contrib']);
};

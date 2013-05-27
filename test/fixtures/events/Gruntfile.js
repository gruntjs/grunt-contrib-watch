module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    watch: {
      all: {
        files: ['lib/*.js'],
      },
      onlyAdded: {
        options: {
          event: 'added',
        },
        files: ['lib/*.js'],
      },
      onlyChanged: {
        options: {
          event: 'changed',
        },
        files: ['lib/*.js'],
      },
      onlyDeleted: {
        options: {
          event: 'deleted',
        },
        files: ['lib/*.js'],
      },
      onlyAddedAndDeleted: {
        options: {
          event: ['added', 'deleted'],
        },
        files: ['lib/*.js'],
      },
      targetOne: { files: ['lib/one/*.js'] },
      targetTwo: { files: ['lib/two/*.js'] },
    },
  });

  // Load this watch task
  grunt.loadTasks('../../../tasks');

  var timeout;

  // trigger on watch events
  grunt.event.on('watch', function(action, filepath) {
    grunt.log.writeln(filepath + ' was indeed ' + action);
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      grunt.util.exit(0);
    }, 2000);
  });

  // trigger on target wildcard watch event
  grunt.event.on('watch.*', function(action, filepath) {
    grunt.log.writeln('wildcard target event was fired')
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      grunt.util.exit(0);
    }, 2000);
  });

  // trigger on targetOne specific watch event
  grunt.event.on('watch.targetOne', function(action, filepath) {
    grunt.log.writeln('targetOne specifc event was fired')
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      grunt.util.exit(0);
    }, 2000);
  });

  // trigger on targetTwo specific watch event
  grunt.event.on('watch.targetTwo', function(action, filepath) {
    grunt.log.writeln('targetTwo specifc event was fired')
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      grunt.util.exit(0);
    }, 2000);
  });
};

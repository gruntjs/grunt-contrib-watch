module.exports = function(grunt) {
  'use strict';

  var path = require('path');

  grunt.initConfig({
    watch: {
      options: {
        livereload: true,
      },
      basic: {
        files: ['lib/*.js'],
        tasks: ['before'],
      },
      customport: {
        files: ['lib/*.js'],
        tasks: ['before'],
        options: {
          livereload: {
            port: 8675,
          },
        },
      },
      differentfiles: {
        files: ['lib/*.js'],
        options: {
          livereload: {
            port: 9877,
          },
        },
      },
      multiplefiles: {
        files: ['lib/*.js'],
        tasks: ['before'],
        options: {
          livereload: {
            port: 9876,
          },
        },
      },
      nospawn: {
        files: ['lib/*.js'],
        tasks: ['before'],
        options: {
          spawn: false,
          livereload: 1337,
        },
      },
      notasks: {
        files: ['lib/*.js'],
      },
      triggerwrite: {
        files: ['sass/*'],
        tasks: ['writecss'],
        options: {
          livereload: false,
        },
      },
      triggerlr: {
        files: ['css/*'],
      },
      livereloadOnErrorTrue: {
        files: ['lib/*.js'],
        tasks: ['iamerror'],
        options: {
          livereload: true
          //normal, no flag
        }
      },
      livereloadOnErrorFalse: {
        files: ['lib/*.js'],
        tasks: ['iamerror'],
        options: {
          livereload: true,
          livereloadOnError: false
        }
      },
      livereloadOnErrorFalseNoSpawn: {
        files: ['lib/*.js'],
        tasks: ['iamerror'],
        options: {
          livereload: true,
          spawn: false,
          livereloadOnError: false
        },
      },
    },
  });

  // Load this watch task
  grunt.loadTasks('../../../tasks');

  grunt.registerTask('before', function() {
    grunt.log.writeln('I ran before livereload.');
  });

  grunt.registerTask('writecss', function() {
    grunt.file.write(path.join(__dirname, 'css', 'one.css'), '#one {}');
  });

  grunt.registerTask('iamerror', function() {
    grunt.fail.warn('I am an error/warning');
  });
};

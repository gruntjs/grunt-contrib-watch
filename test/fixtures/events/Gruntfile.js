module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    chokidar: {
      all: {
        files: ['lib/*.js'],
      },
      onlyAdded: {
        options: {
          event: 'add',
        },
        files: ['lib/*.js'],
      },
      onlyChanged: {
        options: {
          event: 'change',
        },
        files: ['lib/*.js'],
      },
      onlyDeleted: {
        options: {
          event: 'unlink',
        },
        files: ['lib/*.js'],
      },
      onlyAddedAndDeleted: {
        options: {
          event: ['add', 'unlink'],
        },
        files: ['lib/*.js'],
      },
      targetOne: { files: ['lib/one/*.js'] },
      targetTwo: { files: ['lib/two/*.js'] },
      changeTasks: {
        files: ['lib/*.js'],
        tasks: ['echo:prechange']
      },
    },
    echo: {
      prechange: { message: 'I havent changed' },
      postchange: { message: 'Ive changed' },
    },
  });

  // Load this chokidar task
  grunt.loadTasks('../../../tasks');

  // Load the echo task
  grunt.loadTasks('../tasks');

  var timeout;

  // trigger on chokidar events
  grunt.event.on('chokidar', function(action, filepath, target) {
    var map = {
      add: 'added',
      addDir: 'added',
      unlink: 'deleted',
      unlinkDir: 'deleted',
      change: 'changed',
      error: 'error'
    };

    grunt.log.writeln(filepath + ' was indeed ' + map[action]);
    if (target !== undefined) {
      grunt.log.writeln(target + ' specifc event was fired')
    }
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      grunt.util.exit(0);
    }, 2000);

    if (target === 'changeTasks') {
      grunt.config('chokidar.changeTasks.tasks',['echo:postchange']);
    }
  });

};

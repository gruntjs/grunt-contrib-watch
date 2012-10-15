module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    echo: {
      one: { message: 'one has changed' },
      two: { message: 'two has changed' },
    },
    watch: {
      one: {
        files: ['lib/one.js'],
        tasks: ['echo:one']
      },
      two: {
        files: ['lib/two.js'],
        tasks: ['echo:two']
      },
    }
  });
  grunt.loadTasks('../tasks');
  grunt.registerTask('default', ['echo']);
};

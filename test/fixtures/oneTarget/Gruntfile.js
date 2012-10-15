module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    echo: {
      files: ['lib/*.js']
    },
    watch: {
      files: ['<%= echo.files %>'],
      tasks: ['echo']
    }
  });
  grunt.loadTasks('../tasks');
  grunt.registerTask('default', ['echo']);
};

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    chokidar: {
      negate: {
        files: ['lib/**/*.js', '!lib/sub/*.js'],
        tasks: ['echo'],
      },
    },
  });

  // Load this chokidar task
  grunt.loadTasks('../../../tasks');

  grunt.registerTask('default', ['echo']);

  grunt.registerTask('echo', function() {
    grunt.log.writeln('echo task has ran.');
  });
};

/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';
  grunt.registerMultiTask('echo', 'A task that echos a message.', function() {
    var msg = this.data.message || 'I do absolutely nothing.';
    grunt.log.writeln(msg);
  });
};

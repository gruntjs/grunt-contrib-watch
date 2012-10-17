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
    var wait = this.data.wait || 0;
    var done = this.async();

    // After a given time print a message
    setTimeout(function() {
      grunt.log.writeln(msg);
      done();
    }, wait);

    // Keep the process alive
    setInterval(function() {}, 250);
  });
};

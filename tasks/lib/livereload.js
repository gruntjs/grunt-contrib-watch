/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var tinylr = require('tiny-lr');

module.exports = function(grunt) {

  var defaults = {
    port: 35729,
  };

  function LR(options) {
    if (options === true) {
      options = defaults;
    } else if (typeof options === 'number') {
      options = {port: options};
    } else {
      options = grunt.util._.defaults(options, defaults);
    }
    this.server = tinylr();
    this.server.listen(options.port, function(err) {
      if (err) { return grunt.fatal(err); }
      grunt.log.verbose.writeln('Live reload server started on port: ' + options.port);
    });
  }

  LR.prototype.trigger = function(files) {
    grunt.log.verbose.writeln('Live reloading ' + grunt.log.wordlist(files) + '...');
    this.server.changed({body:{files:files}});
  };

  return function(options) {
    return new LR(options);
  };
};

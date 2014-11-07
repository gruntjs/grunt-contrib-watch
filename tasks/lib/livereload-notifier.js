/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 Body Labs, Inc., contributors
 * Licensed under the MIT license.
 */

'use strict';

var request = require('request');
var _ = require('lodash');

module.exports = function(grunt) {

  var defaults = { port: 35729 };

  function LRNotifier(options) {
    if (options === true) {
      options = defaults;
    } else if (typeof options === 'number') {
      options = {port: options};
    } else {
      options = _.defaults(options, defaults);
    }

    this.port = options.port;
  }

  LRNotifier.prototype.trigger = function(files) {

    var uri = 'http://localhost:' + this.port + '/changed';

    var options = {
      method: 'post',
      uri: uri,
      body: {files: files},
      json: true,
    };
    request(options, function(error, response, body) {
      if (error) {
        grunt.log.writeln('Error triggering live reload to ' + uri);
        grunt.log.writeln(error);
      } else if (response.statusCode != 200) {
        grunt.log.writeln('Error triggering live reload to ' + uri);
        grunt.log.writeln(JSON.stringify(body));
      } else {
        grunt.log.verbose.writeln('Triggered live reload for ' + grunt.log.wordlist(files) + '...');
      }
    });
  };

  return function(options) {
    return new LRNotifier(options);
  };
};

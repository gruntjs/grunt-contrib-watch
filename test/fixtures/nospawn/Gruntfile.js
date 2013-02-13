module.exports = function(grunt) {
  'use strict';

  var http = require('http');
  var port = 8080;

  grunt.initConfig({
    watch: {
      nospawn: {
        files: ['lib/nospawn.js'],
        tasks: ['server'],
        options: {
          nospawn: true
        }
      },
      spawn: {
        files: ['lib/spawn.js'],
        tasks: ['server']
      }
    }
  });

  // Load this watch task
  grunt.loadTasks('../../../tasks');

  // Our test server task
  var server;
  grunt.registerTask('server', function() {
    if (!server) {
      server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('It works!');
      }).listen(port);
      grunt.log.writeln('Server is listening...');
    } else {
      http.request({port: port}, function(res) {
        res.on('data', function(buf) {
          grunt.log.writeln(buf);
        });
      }).end();
    }
  });

  grunt.registerTask('default', ['server', 'watch']);
};

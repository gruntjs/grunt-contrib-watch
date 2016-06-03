module.exports = function(grunt) {
  'use strict';

  var http = require('http');
  var port = 1337;

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    copy: {
      cascade: {
          src: 'lib/source.js',
          dest: 'lib/destination.js',
      },
    },
    watch: {
      nospawn: {
        files: ['lib/nospawn.js'],
        tasks: ['server'],
        options: {
          nospawn: true,
        },
      },
      spawn: {
        files: ['lib/spawn.js'],
        tasks: ['server'],
      },
      cascading: {
        files: ['lib/source.js'],
        tasks: ['copy:cascade'],
        options: {
          nospawn: true,
        },
      },
      cascaded: {
        files: ['lib/destination.js'],
      },
      interrupt: {
        files: ['lib/interrupt.js'],
        tasks: ['long', 'long', 'long'],
        options: {
          nospawn: true,
          interrupt: true,
        },
      },
    },
  });

  // Load this watch task
  grunt.loadTasks('../../../tasks');

  // Our test server task
  var server;
  grunt.registerTask('server', function() {
    if (!server) {
      server = http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Server is talking!');
      }).listen(port);
      grunt.log.writeln('Server is listening...');
    } else {
      var done = this.async();
      http.request({port: port}, function(res) {
        res.on('data', function(buf) {
          grunt.log.writeln(buf);
          done();
        });
      }).end();
    }
  });

  // A long running task
  grunt.registerTask('long', function() {
    setTimeout(this.async(), 2000);
  });

    grunt.registerTask('default', ['server', 'watch']);
};

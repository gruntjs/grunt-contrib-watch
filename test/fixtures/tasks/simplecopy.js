var fs  = require('fs');

module.exports = function(grunt) {
  'use strict';
  grunt.registerMultiTask('simplecopy', 'A task that simply copy a file.', function() {
    var src = this.data.src;
    var dest = this.data.dest;
    var done = this.async();
    var rd = fs.createReadStream(src);
    rd.on("error", function(err) {
      grunt.fail.fatal(err);
    });
    var wr = fs.createWriteStream(dest);
    wr.on("error", function(err) {
      grunt.fail.fatal(err);
    });
    wr.on("close", function(ex) {
      grunt.log.writeln('Copied ' + src + ' to ' + dest + '.');
      done();
    });
    rd.pipe(wr);
  });
};
                         

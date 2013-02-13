var grunt = require('grunt');

var taskrun = module.exports = {
  waiting: 'Waiting...',
  cliArgs: null,
  nameArgs: null,
  changedFiles: Object.create(null)
};

// Do this when watch has completed
function completed(start) {
  grunt.log.writeln('').write(String(
    'Completed in ' +
    Number((Date.now() - start) / 1000).toFixed(2) +
    's at ' +
    (new Date()).toString()
  ).cyan + ' - ' + taskrun.waiting);
}

// Do this when watch has been triggered
function triggered() {
  grunt.log.ok();
  Object.keys(taskrun.changedFiles).forEach(function(filepath) {
    // Log which file has changed, and how.
    grunt.log.ok('File "' + filepath + '" ' + taskrun.changedFiles[filepath] + '.');
  });
  // Reset changedFiles
  taskrun.changedFiles = Object.create(null);
}

// Keep track of spawned processes
var spawned = Object.create(null);

taskrun.spawn = grunt.util._.debounce(function(id, tasks, options, done) {
  // If interrupted, reset the spawned for a target
  if (options.interrupt && typeof spawned[id] === 'object') {
    grunt.log.writeln('').write('Previously spawned task has been interrupted...'.yellow);
    spawned[id].kill('SIGINT');
    delete spawned[id];
  }

  // Only spawn one at a time unless interrupt is specified
  if (!spawned[id]) {
    triggered();

    // Spawn the tasks as a child process
    var start = Date.now();
    spawned[id] = grunt.util.spawn({
      // Spawn with the grunt bin
      grunt: true,
      // Run from current working dir and inherit stdio from process
      opts: {cwd: process.cwd(), stdio: 'inherit'},
      // Run grunt this process uses, append the task to be run and any cli options
      args: grunt.util._.union(tasks, taskrun.cliArgs)
    }, function(err, res, code) {
      // Spawn is done
      delete spawned[id];
      completed(start);
    });
  }
}, 250);

taskrun.nospawn = grunt.util._.debounce(function(id, tasks, options, done) {
  // todo: add interrupt

  triggered();

  // Mark tasks to run and enqueue this task afterward
  var start = Date.now();
  grunt.task.run(tasks).mark().run(taskrun.nameArgs);

  // todo: check if subsequent runs and run completed with start at watch beginning
  completed(start);

  // Finish the task
  done();
}, 250);

# grunt-contrib-watch [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-contrib-watch.png?branch=master)](http://travis-ci.org/gruntjs/grunt-contrib-watch)

> Run predefined tasks whenever watched file patterns are added, changed or deleted.


## Getting Started
If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide, as it explains how to create a [gruntfile][Getting Started] as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:

```shell
npm install grunt-contrib-watch --save-dev
```

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md


## Watch task
_Run this task with the `grunt watch` command._

### Overview

Inside your `Gruntfile.js` file, add a section named `watch`. This section specifies the files to watch, tasks to run when an event occurs and the options used.
### Settings

There are a number of options available. Please review the [minimatch options here](https://github.com/isaacs/minimatch#options). As well as some additional options as follows:

#### files
Type: `String|Array`

This defines what file patterns this task will watch. Can be a string or an array of files and/or minimatch patterns.

#### tasks
Type: `String|Array`

This defines which tasks to run when a watched file event occurs.

#### options.interrupt
Type: `boolean`
Default: false

As files are modified this watch task will spawn tasks in child processes. The default behavior will only spawn a new child process per target when the previous process has finished. Set the `interrupt` option to true to terminate the previous process and spawn a new one upon later changes.

Example:
```js
watch: {
  scripts: {
    files: '**/*.js',
    tasks: ['jshint'],
    options: {
      interrupt: true
    }
  }
}
```

#### options.debounceDelay
Type: `Integer`
Default: 500

How long to wait before emitting events in succession for the same filepath and status. For example if your `Gruntfile.js` file was `changed`, a `changed` event will only fire again after the given milliseconds.

Example:
```js
watch: {
  scripts: {
    files: '**/*.js',
    tasks: ['jshint'],
    options: {
      debounceDelay: 250
    }
  }
}
```

#### options.interval
Type: `Integer`
Default: 100

The `interval` is passed to `fs.watchFile`. Since `interval` is only used by `fs.watchFile` and this watcher also uses `fs.watch`; it is recommended to ignore this option. *Default is 100ms*.

#### options.forceWatchMethod
Type: `false|'new'|'old'`
Default: false

Node.js has two file watching methods: 'old' (`fs.watchFile`) which uses stat polling and 'new' (`fs.watch`) which attempts to use the system's built-in watch mechanism. By default, this watch task uses both methods and which ever method responds first will be used for subsequent events.

There may be some setups where you would need to force a specific watch method, such as on networked file system. Set `options.forceWatchMethod: 'old'` to specifically use the old watch method, `fs.watchFile`.

### Examples

```js
// Simple config to run jshint any time a file is added, changed or deleted
grunt.initConfig({
  watch: {
    files: '**/*',
    tasks: ['jshint']
  }
});
```

```js
// Advanced config. Run specific tasks when specific files are added, changed or deleted.
grunt.initConfig({
  watch: {
    gruntfile: {
      files: 'Gruntfile.js',
      tasks: ['jshint:gruntfile'],
      options: {
        nocase: true
      }
    },
    src: {
      files: ['lib/*.js', 'css/**/*.scss', '!lib/dontwatch.js'],
      tasks: ['default']
    },
    test: {
      files: '<%= jshint.test.src %>',
      tasks: ['jshint:test', 'qunit']
    }
  }
});
```


## Release History

 * 2012-12-14   v0.2.0   Conversion to grunt v0.4 conventions. Remove node v0.6 and grunt v0.3 support. Allow watch task to be renamed. Use grunt.util.spawn "grunt" option.
 * 2012-10-31   v0.1.4   Prevent watch from spawning duplicate watch tasks
 * 2012-10-27   v0.1.3   Better method to spawn the grunt bin Bump gaze to v0.2.0. Better handles some events and new option forceWatchMethod Only support Node.js >= v0.8
 * 2012-10-16   v0.1.2   Only spawn a process per task one at a time Add interrupt option to cancel previous spawned process Grunt v0.3 compatibility changes
 * 2012-10-15   v0.1.1   Fallback to global grunt bin if local doesnt exist. Fatal if bin cannot be found Update to gaze 0.1.6
 * 2012-10-07   v0.1.0   Release watch task Remove spawn from helper Run on Grunt v0.4

---

Task submitted by [Kyle Robinson Young](http://dontkry.com)

*This file was generated on Thu Dec 13 2012 11:57:38.*

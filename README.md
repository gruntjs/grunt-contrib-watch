# grunt-contrib-watch [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-contrib-watch.png?branch=master)](http://travis-ci.org/gruntjs/grunt-contrib-watch)

> Run predefined tasks whenever watched file patterns are added, changed or deleted.

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-contrib-watch`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-contrib-watch');
```

[grunt]: https://github.com/gruntjs/grunt
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

### Overview

Inside your `grunt.js` file, add a section named `watch`. This section specifies the files to watch, tasks to run when an event occurs and the options used.

##### files ```string|array```

This defines what file patterns this task will watch. Can be a string or an array of files and/or [minimatch](https://github.com/isaacs/minimatch) patterns.

##### tasks ```string|array```

This defines which tasks to run when a watched file event occurs.

##### options ```array```

This controls how this task operates and should contain key:value pairs, see options below.

#### Options

There are a number of options available. Please review the [minimatch options here](https://github.com/isaacs/minimatch#options). As well as some additional options as follows:

##### debounceDelay ```integer```

How long to wait before emitting events in succession for the same filepath and status. For example if your `grunt.js` file was `changed`, a `changed` event will only fire again after the given milliseconds. *Default is 500ms.*

Example:
``` javascript
watch: {
  scripts: {
    files: '**/*.js',
    tasks: ['lint'],
    options: {
      debounceDelay: 250
    }
  }
}
```

##### interval ```integer```

The `interval` is passed to `fs.watchFile`. Since `interval` is only used by `fs.watchFile` and this watcher also uses `fs.watch`; it is recommended to ignore this option. *Default is 100ms*.

#### Config Example

``` javascript
watch: {
  scripts: {
    files: [
      'grunt.js',
      'tasks/**/*.js',
      '<config:nodeunit.tasks>'
    ],
    tasks: ['lint', 'test']
  }
}
```

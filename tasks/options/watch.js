var Helpers = require('../helpers');

var scripts = '{app,tests}/**/*.{js,coffee}';
var templates = 'app/templates/**/*.{hbs,handlebars,hjs,emblem}';
var styles = 'app/styles/**/*.{css,sass,scss,less,styl}';
var other = '{app,tests,public}/**/*';

module.exports = {
  scripts: {
    files: [scripts],
    tasks: ['lock', 'buildScripts', 'unlock']
  },
  templates: {
    files: [templates],
    tasks: ['lock', 'buildTemplates:debug', 'unlock']
  },
  styles: {
    files: [styles],
    tasks: ['lock', 'buildStyles', 'unlock']
  },
  other: {
    files: [other, '!'+scripts, '!'+templates, '!'+styles],
    tasks: ['build:debug']
  },

  options: {
    debounceDelay: 200,
    livereload: Helpers.isPackageAvailable("connect-livereload")
  }
};

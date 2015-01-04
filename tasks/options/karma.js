module.exports = {
  options: {
    browsers: ['Chrome'],
    reporters: ['coverage', 'dots']
  },
  ci: {
    singleRun: true,
    browsers: ['PhantomJS']
  },
  test: {
    singleRun: true
  },
  server: {
    background: true,
    coverageReporter: {
      type : ['html'],
      dir : 'coverage/'
    }
  },
  browsers: {
    singleRun: true,
    browsers: ['Chrome',
               'ChromeCanary',
               'Firefox',
               // 'Safari',  // enable plugin in karma.conf.js to use
               'PhantomJS']
  }
};

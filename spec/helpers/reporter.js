// eslint-disable-next-line node/no-unpublished-require
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

jasmine.getEnv().addReporter(new SpecReporter({  // add jasmine-spec-reporter
    spec: {
        displayPending: true,
        displayStacktrace: 'raw'
    }
}));
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

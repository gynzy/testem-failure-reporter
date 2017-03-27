var colors = require('colors/safe');

function FailureReporter(out) {
    this.out = out || process.stdout;
    this.total = 0;
    this.fail = 0;
    this.pass = 0;  // used by ci/index.js getExitCode
}

FailureReporter.prototype = {
    report: function(prefix, data) {
        this.display(prefix, data);
        this.total++;
        if (!data.passed) {
            this.fail++;
        } else {
            this.pass++;
        }
    },
    display: function(prefix, result) {
        if (result.passed) {
			this.out.write('.');
            return;
        }
		this.out.write(colors.red('Failed: ' + result.name + '\n'));
		this.out.write('Actual: ' + result.error.actual + '\n');
		this.out.write('Expected: ' +  result.error.expected + '\n');
		this.out.write('Message: ' + result.error.message + '\n');
		this.out.write('Stack:' + '\n');
		this.out.write(result.error.stack + '\n\n');
    },
    finish: function() {
        var summary = '\n'+this.fail+'/'+this.total+' failed\n';
        if (this.fail === 0) {
            this.out.write(colors.green.bold(summary));
        } else {
            this.out.write(colors.red.bold(summary));
        }
    }
};

module.exports = FailureReporter;

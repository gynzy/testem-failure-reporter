var chalk = require('chalk');

function FailureReporter(out) {
    this.out = out || process.stdout;
    this.total = 0;
    this.fail = 0;
    this.pass = 0;  // used by ci/index.js getExitCode
}

var errorTitle = chalk.white.bgRed.bold;
var error = chalk.red;

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
            return;
        }
		this.out.write(errorTitle('Failed: ' + result.name + '\n'));
		this.out.write(error('Actual: ' + result.error.actual + '\n'));
		this.out.write(error('Expected: ' +  result.error.expected + '\n'));
		this.out.write(error('Message: ' + result.error.message + '\n'));
		this.out.write(error('Stack:' + '\n'));
		this.out.write(error(result.error.stack) + '\n\n');
    },
    finish: function() {
        var summary = '\n '+this.fail+'/'+this.total+' failed \n';
        if (this.fail === 0) {
            this.out.write(chalk.gray.bgGreen.bold(summary));
        } else {
            this.out.write(errorTitle(summary));
        }
    }
};
module.exports = FailureReporter;

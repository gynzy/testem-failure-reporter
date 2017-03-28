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
		console.error(errorTitle('Failed: ' + result.name + '\n'));
		console.error(error('Actual: ' + result.error.actual + '\n'));
		console.error(error('Expected: ' +  result.error.expected + '\n'));
		console.error(error('Message: ' + result.error.message + '\n'));
		console.error(error('Stack:' + '\n'));
		console.error(error(result.error.stack) + '\n\n');
    },
    finish: function() {
        var summary = '\n '+this.fail+'/'+this.total+' failed \n';
        if (this.fail === 0) {
            console.log(chalk.gray.bgGreen.bold(summary));
        } else {
	    console.error(errorTitle(summary));
        }
    }
};
module.exports = FailureReporter;

const chalk = require('chalk'),
	{BigQuery} = require('@google-cloud/bigquery'),
	bigquery = new BigQuery();

const DATASET = "DWH_TEST",
	TABLE = "FRONTEND_TEST_FAILURES";

function FailureReporter(out) {
	this.out = out || process.stdout;
	this.total = 0;
	this.fail = 0;
	this.pass = 0;  // used by ci/index.js getExitCode
}

const errorTitle = chalk.white.bgRed.bold;
const error = chalk.red;

/**
 * Insert row into Bigquery to keep track of failures
 * @param {string} name - the test name
 * @param {string} message - the test failure message
 * @param {stdout} output - output object/class. must implement write('string') fn
 * @param {string} stack - stacktrace of the error
 */
function insertFailedTestIntoBigquery(name, message, stack, output) {
	// check if env is set for insertion. otherwise skip
	if (!process.env.SAVE_FAILURES_IN_BQ && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
		return; // do nothing
	}

	const timestamp = Math.round(Date.now() / 1000); // unix timestamp in seconds
	const row = {name, timestamp, message, stack};
	bigquery
		.dataset(DATASET)
		.table(TABLE)
		.insert([row]).catch((err) => {
		output.write('Unable to insert failure into bigquery with error:' + err + ' \r\n');
		output.write('Stack: ' + err.stack + '\r\n');
	})
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
			return;
		}
		this.out.write(errorTitle('Failed: ' + result.name + '\n'));
		this.out.write(error('Actual: ' + result.error.actual + '\n'));
		this.out.write(error('Expected: ' +  result.error.expected + '\n'));
		this.out.write(error('Message: ' + result.error.message + '\n'));
		this.out.write(error('Stack:' + '\n'));
		this.out.write(error(result.error.stack) + '\n\n');
		insertFailedTestIntoBigquery(result.name, result.error.message, result.error.stack, this.out);
	},
	finish: function() {
		const summary = '\n '+this.fail+'/'+this.total+' failed \n';
		if (this.fail === 0) {
			this.out.write(chalk.gray.bgGreen.bold(summary));
		} else {
			this.out.write(errorTitle(summary));
		}
	}
};
module.exports = FailureReporter;

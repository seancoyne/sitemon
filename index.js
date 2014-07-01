#!/usr/bin/env node
module.exports = function(url, command, retries, interval, timeout){

	return require("http-monitor")(url, {
		retries: (retries || 1),
		interval: (interval || 300000),
		timeout: (timeout || 30000)
	}).on('error', function(err) {
		console.warn(new Date(), "Site is down!");
		require("child_process").exec(command, function(err, stdout, stderr){
			if (err) console.error(new Date(), err);
			if (stdout) console.info(new Date(), stdout);
			if (stderr) console.error(new Date(), stderr);
		});
	}).on('recovery', function() {
		console.info(new Date(), "Site is back up!");
	}).on('check', function(statusCode){
		console.info(new Date(), "Site is up.  Status Code:", statusCode);
	});

};

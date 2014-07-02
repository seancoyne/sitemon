#!/usr/bin/env node
module.exports = function(url, command, retries, interval, timeout, onError, onRecovery, onCheck, onCommandComplete){

	return require("http-monitor")(url, {
		retries: (retries || 1),
		interval: (interval || 300000),
		timeout: (timeout || 30000)
	}).on('error', function(err) {
		if (onError){
			onError(err);
		}
		require("child_process").exec(command, function(err, stdout, stderr){
			if (onCommandComplete) {
				onCommandComplete(err, stdout, stderr);
			}
		});
	}).on('recovery', function() {
		if (onRecovery){
			onRecovery();
		}
	}).on('check', function(statusCode){
		if (onCheck) {
			onCheck(statusCode);
		}
	});

};

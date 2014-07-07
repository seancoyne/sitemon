#!/usr/bin/env node

/**
* 
*
* Installs sitemon as a Windows Service using NSSM (http://www.nssm.cc/)
* 
* 
*/

var prompt = require("prompt"),
	optimist = require('optimist'),
	exec = require("child_process").exec,
	os = require("os");

if (os.platform() != 'win32') {
	console.error("Windows is the only supported operating system for this utility");
	process.exit(1);
}

prompt.message = "";
prompt.delimiter = "";
prompt.start();

// allow command line override
prompt.override = optimist.argv;

prompt.get({
	properties: {
		servicename: {
			description: "Service Name",
			default: "Site Monitor",
			type: "string",
			required: true
		},
		pathtonssm: {
			description: "Path to nssm.exe?",
			default: "c:\\nssm-2.23\\win64\\nssm.exe",
			type: "string",
			required: true
		}
	}
}, function(err, result){
	
	var nssmPath = result.pathtonssm;
	var nssmServiceName = result.servicename;
	var nssmStopCommand = nssmPath + ' stop "' + nssmServiceName + '"';
	var nssmRemoveCommand = nssmPath + ' remove "' + nssmServiceName + '" confirm';
	
	var runCommand = function(command, cb) {
		exec(command, function(err, stdout, stderr){
			if (err) console.error(err);
			if (stdout) console.log(stdout);
			if (stderr) console.log(stderr);
			if (cb) {
				cb();
			}
		});
	}

	runCommand(nssmStopCommand, function(){
		runCommand(nssmRemoveCommand, function(){
			console.log("Complete!");		
		});
	});
	
});
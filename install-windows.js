#!/usr/bin/env node

/**
* 
*
* Installs sitemon as a Windows Service using NSSM (http://www.nssm.cc/)
* 
* 
*/

var prompt = require("prompt"),
	path = require("path"),
	exec = require("child_process").exec,
	os = require("os");

if (os.platform() != 'win32') {
	console.error("Windows is the only supported operating system for this utility");
	process.exit(1);
}

prompt.message = "";
prompt.delimiter = "";
prompt.start();

prompt.get({
	properties: {
		servicename: {
			description: "Service Name",
			default: "Site Monitor",
			type: "string",
			required: true
		},
		servicedescription: {
			description: "Service Description",
			default: "Monitors a URL and, if non-respsonsive, executes a command.",
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
	
	var siteMonPath = path.normalize(__dirname + "/bin/sitemon");
	var nodePath = process.execPath;
	var logDir = path.dirname(path.dirname(siteMonPath));
	
	var nssmPath = result.pathtonssm;
	var nssmServiceName = result.servicename;
	var nssmAppDirectory = path.dirname(siteMonPath);
	var nssmServiceDescription = result.servicedescription;
	var nssmInstallCommand = nssmPath + ' install "' + nssmServiceName + '" "' + nodePath + '" "' + siteMonPath + '"';
	var nssmErrorLogPath = path.normalize(logDir + '/stderr.log');
	var nssmOutLogPath = path.normalize(logDir + '/stdout.log');
	
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
	
	var setNSSMServiceProperty = function(servicename, property, value, cb) {
		runCommand(nssmPath + ' set "' + servicename + '" ' + property + ' "' + value + '"', function(){
			if (cb) {
				cb();
			}
		});
	}
	
	runCommand(nssmInstallCommand, function(){
		setNSSMServiceProperty(nssmServiceName, 'Description', nssmServiceDescription, function(){
			setNSSMServiceProperty(nssmServiceName, 'AppDirectory', nssmAppDirectory, function(){
				setNSSMServiceProperty(nssmServiceName, 'AppStderr', nssmErrorLogPath, function(){
					setNSSMServiceProperty(nssmServiceName, 'AppStdout', nssmOutLogPath, function(){
						console.log("Complete!");
					});
				});
			});
		});
	});
	
});
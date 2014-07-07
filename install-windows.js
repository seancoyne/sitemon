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
		},
		command: {
			description: "Command to execute when the site is down?",
			default: 'net stop \\"Apache2.2\\" && net start \\"Apache2.2\\"',
			type: "string",
			required: true
		},
		uri: {
			description: "URL to check?",
			default: "http://localhost/",
			message: "Must be a valid URL",
			pattern: /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
			required: true
		},
		interval: {
			description: "How often, in minutes, should we check?",
			default: 5,
			message: "Must be a valid integer",
			pattern: /^[\d]{1,}$/,
			required: true
		},
		timeout: {
			description: "How long should we wait, in seconds, for the site to respond?",
			default: 30,
			message: "Must be a valid integer",
			pattern: /^[\d]{1,}$/,
			required: true	
		},
		retries: {
			description: "How many times should we try accessing the website before restarting it?",
			default: 1,
			message: "Must be a valid integer",
			pattern: /^[\d]{1,}$/,
			required: true
		}
	}
}, function(err, result){
	
	var siteMonPath = path.normalize(__dirname + "/bin/sitemon");
	var siteMonArgs = ([
			'--url', '""' + result.uri + '""', 
			'--interval', result.interval, 
			'--timeout', result.timeout, 
			'--retries', result.retries, 
			'--command', '\'' + result.command + '\''
	]).join(" ");
	var nodePath = process.execPath;
	var logDir = path.dirname(path.dirname(siteMonPath));
	
	var nssmPath = result.pathtonssm;
	var nssmServiceName = result.servicename;
	var nssmInstallCommand = nssmPath + ' install "' + nssmServiceName + '" "' + nodePath + '"';
	var nssmAppDirectory = path.dirname(nodePath);
	var nssmApplication = nodePath;
	var nssmAppParameters = siteMonPath + ' ' + siteMonArgs;
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
		setNSSMServiceProperty(nssmServiceName, 'AppDirectory', nssmAppDirectory, function(){
			setNSSMServiceProperty(nssmServiceName, 'AppParameters', nssmAppParameters, function(){
				setNSSMServiceProperty(nssmServiceName, 'AppStderr', nssmErrorLogPath, function(){
					setNSSMServiceProperty(nssmServiceName, 'AppStdout', nssmOutLogPath, function(){
						console.log("Complete!");
					});
				});
			});
		});
		
	});
	
});
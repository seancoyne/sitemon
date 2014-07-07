# Site Monitor

Monitors a URL.  If unavailable a command is executed.

## Installation

`npm install -g sitemon`

## Usage

Update the .sitemonrc file to match your settings (the URL, command to run, etc) then run `./bin/sitemon` or if you installed globally, just `sitemon`

You can run any command when the server is unavailable that you can run from the command line.  Be sure to run sitemon as the appropriate user so that your commands are successful.

## Service

You can also run this as a service.  On Windows I use [NSSM - The Non-Sucking Service Manager](http://www.nssm.cc/) for this.

## Node Module

There is a node module available.  If you `var sitemon = require('sitemon')` you can use it as follows:

````javascript
var sitemon = require("sitemon");
sitemon(< url >, < command >, < retries >, < interval, in ms >, < timeout, in ms >, < onError callback, receives err parameter >, < onRecovery callback, no params >, < onCheck callback, receives statusCode parameter >, < onCommandComplete callback, receives err, stdout, stderr params >);
````

ex:

````javascript
var sitemon = require("sitemon");
sitemon(
	"http://localhost/",
	"net stop ""Apache2.2"" && net start ""Apache2.2""",
	1, // 1 try
	300000, // 5 minute interval
	30000, // 30 second timeout
	console.log, // log the error
	function () { // run this closure onRecovery
		console.log("Site recovered!");
	},
	function (statusCode) { // run this closure onCheck
		console.log("Site is up, status code was", statusCode);
	},
	function (err, stdout, stderr){ // run this closure onCommandComplete
		if (err) console.error(err);
		if (stdout) console.log(stdout);
		if (stderr) console.err(stderr);
	});
````
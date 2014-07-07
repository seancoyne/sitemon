# Site Monitor

Monitors a URL.  If unavailable a command is executed.

## Installation

`npm install -g git://github.com/seancoyne/sitemon.git`

## Usage

Create a `.sitemonrc` in your home directory in the following format:
````JSON
{
	"url": "http://localhost/",
	"command": "Echo \"No action taken\" && exit 0",
	"interval": 5,
	"timeout": 30,
	"retries": 1
}
````

where URL is the URL to monitor, command is the command to run, interval is how often, in minutes to check, timeout is the time in seconds to wait for the URL to respond and retries is the number of times to try the URL.

You can run any command when the server is unavailable that you can run from the command line.  Be sure to run sitemon as the appropriate user so that your commands are successful.

## Service

You can also run this as a service.  On Windows I use [NSSM - The Non-Sucking Service Manager](http://www.nssm.cc/) for this.  I have included two scripts `install-windows.js` and `uninstall-windows.js` that will install or uninstall a Windows service.  This uses NSSM so you will need to have that on your system prior to running these, and know the path to the nssm.exe executable.

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
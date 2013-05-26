// chrome app specific implementation start here

var protocol = STK500;
var serialLogging = false;

var readLen = 128;

console.log("starting up!");

var chromeSerialReadCallbackArm = function(dataLen) {
	if (!protocol.port) {
		console.log("chromeSerialReadCallbackArm() called without active port");
		return;
	}
	
	if (dataLen === undefined) {
		readLen = 128;
	} else {
		readLen = dataLen;
	}
	
	if (serialLogging == true) {
		console.log("chromeSerialReadCallbackArm(" + readLen + ")");
	}
	
	// setup our read callback
	chrome.serial.read(protocol.port.connectionId, readLen, chromeSerialRead);
};

var chromeSerialRead = function(readData) {
	if (!protocol.port) {
		console.log("chromeSerialRead() called without active port");
		return;
	}
	
	if (readData && readData.bytesRead > 0 && readData.data) {
		if (serialLogging == true) {
			console.log("chromeSerialRead(): " + bufferToString(readData.data));
		}
		
		// call the actual protocol recieve method
		protocol.recieve(readData.data);
		
	} else {
		chrome.serial.read(protocol.port.connectionId, readLen, chromeSerialRead);		
	}
	
};

var chromeSerialWrite = function(data) {
	if (!protocol.port) {
		console.log("chromeSerialWrite() called without active port");
		return;
	}
	
	if (serialLogging == true) {
		console.log("chromeSerialWrite(): " +  bufferToString(data.buffer));
	}
	
	chrome.serial.write(protocol.port.connectionId, data.buffer, function() {}); 
};

var chromeSerialFlush = function() {
	if (!protocol.port) {
		console.log("chromeSerialFlush() called without active port");
		return;
	}
	
	if (serialLogging == true) {
		console.log("chromeSerialFlush()");
	}
	
	chrome.serial.flush(protocol.port.connectionId, function() {});
};

var chromeSerialSetDTR_RTS = function(state) {
	if (!protocol.port) {
		console.log("chromeSerialSetDTR_RTS() called without active port");
		return;
	}
	
	if (serialLogging == true) {
		console.log("chromeSerialSetDTR_RTS(): " + state);
	}
	
	chrome.serial.setControlSignals(protocol.port.connectionId, { dtr: state, rts: state}, function() {});
};

var chromeSerialClose = function() {
	if (!protocol.port) {
		console.log("chromeSerialClose() called without active port");
		return;
	}
	
	if (serialLogging == true) {
		console.log("chromeSerialClose()");
	}
	
	chrome.serial.close(protocol.port.connectionId, function() {});
};

var bufferToString = function(buffer) {
	return String.fromCharCode.apply(null, new Uint8Array(buffer));
};









// serial setup
chrome.serial.getPorts(function(ports) {
	
	// filter out bluetooth port
	var eligiblePorts = ports.filter(function(port) {
		return (!port.match(/[Bb]luetooth/) && port.match(/tty/));
	});
	
	console.log("ports:");
	for (var i = 0; i < eligiblePorts.length; i++) {
	    console.log("\t" + eligiblePorts[i]);
	}

	// TODO currently hardcoding to the first found port
	var selectedPort = eligiblePorts[0];
	
	console.log("opening port: " + selectedPort);
	
	chrome.serial.open(selectedPort, {bitrate: protocol.baudrate},  function(port) {
		if (!port || !port.connectionId || port.connectionId < 0) {
			console.log(selectedPort + " failed to open");
			return;
		}
		
		console.log(selectedPort + " opened successfully");
		
		// execute all setup methods here to avoid chrome specifics within the STK500 object
		protocol.port = port;
		
		// overwrite our protocol port methods
		protocol.portSend = chromeSerialWrite;
		protocol.portFlush = chromeSerialFlush;
		protocol.portSetDTR_RTS = chromeSerialSetDTR_RTS;
		protocol.portClose = chromeSerialClose;
		protocol.portReadCallbackArm = chromeSerialReadCallbackArm;		
		
		// initialize the protocol
		protocol.initialize({
			success: function(data) {
				console.log("Initialized - Hardware Version: " + data.hardwareVersion + ", Firmware Version: " + data.versionMajor + "." + data.versionMinor + " Signature: " + data.signature);
				/* This doesnt work (at least for what im looking at right now)
				STK500.getBoardDetails({
					success: function(data) {
						console.log("Board Details fetched");
					}
				});
				*/
			},
			error: function() {
				console.log("Error Initializing");
			}
		
		});
	});
});


var STK500 = {
	// Constants
	constants: {
		NONE: 					0,
		STK_OK:					0x10,
		STK_FAILED: 			0x11,  // Not used
		STK_UNKNOWN: 			0x12,  // Not used
		STK_NODEVICE: 			0x13,  // Not used
		STK_INSYNC: 			0x14,  // ' '
		STK_NOSYNC: 			0x15,  // Not used
		ADC_CHANNEL_ERROR: 		0x16,  // Not used
		ADC_MEASURE_OK: 		0x17,  // Not used
		PWM_CHANNEL_ERROR: 		0x18,  // Not used
		PWM_ADJUST_OK:			0x19,  // Not used
		CRC_EOP:				0x20,  // 'SPACE'
		STK_GET_SYNC: 			0x30,  // '0'
		STK_GET_SIGN_ON: 		0x31,  // '1'
		STK_SET_PARAMETER: 		0x40,  // '@'
		STK_GET_PARAMETER: 		0x41,  // 'A'
		STK_SET_DEVICE: 		0x42,  // 'B'
		STK_SET_DEVICE_EXT: 	0x45,  // 'E'
		STK_ENTER_PROGMODE: 	0x50,  // 'P'
		STK_LEAVE_PROGMODE: 	0x51,  // 'Q'
		STK_CHIP_ERASE: 		0x52,  // 'R'
		STK_CHECK_AUTOINC: 		0x53,  // 'S'
		STK_LOAD_ADDRESS: 		0x55,  // 'U'
		STK_UNIVERSAL: 			0x56,  // 'V'
		STK_PROG_FLASH: 		0x60,  // '`'
		STK_PROG_DATA: 			0x61,  // 'a'
		STK_PROG_FUSE: 			0x62,  // 'b'
		STK_PROG_LOCK: 			0x63,  // 'c'
		STK_PROG_PAGE: 			0x64,  // 'd'
		STK_PROG_FUSE_EXT: 		0x65,  // 'e'
		STK_READ_FLASH: 		0x70,  // 'p'
		STK_READ_DATA: 			0x71,  // 'q'
		STK_READ_FUSE: 			0x72,  // 'r'
		STK_READ_LOCK: 			0x73,  // 's'
		STK_READ_PAGE: 			0x74,  // 't'
		STK_READ_SIGN: 			0x75,  // 'u'
		STK_READ_OSCCAL: 		0x76,  // 'v'
		STK_READ_FUSE_EXT: 		0x77,  // 'w'
		STK_READ_OSCCAL_EXT: 	0x78   // 'x'
	},
	
	states: {
		INITIALIZING: 			0,
		WAITING: 				1,
		READING: 				2,
		RESULT_READY: 			3,
		TIMEOUT_OCCURRED: 		4,
		STOPPED: 				5,
		FAIL: 					6
	},
	
	
	// states + settings
	port:  						false,
	baudrate: 					115200,
	
	description: 				"",
	type: 						"",
	
	maximumSize: 				126976,
	
	pageSize: 					256,
	
	lockBits: 					0x0F,
	unlockBits:					0x3F,
	lowFuses: 					0xF7,
	highFuses: 					0xDA,
	extendedFuses: 				0xF5,
	
	
	currentState: 				0,
	currentCommand: 			0, // this keeps track of current command for read callback purposes
	
	// methods
	portSend: function(data) { console.log("STK500.portSend needs to be overwritten"); }, // overwrite this method for serial specific implementation
	portFlush: function() { console.log("STK500.portFlush needs to be overwritten"); }, // overwrite this method for serial specific implementation
	portSetDTR_RTS: function() { console.log("STK500.portSetDTR_RTS needs to be overwritten"); }, // overwrite this method for serial specific implementation
	portClose: function() { console.log("STK500.portClose needs to be overwritten"); }, // overwrite this method for serial specific implementation
	portReadReady: function() { console.log("STK500.portReadReady needs to be overwritten"); }, // overwrite this method for serial specific implementation
	
	
	
	initialize: function() {
		console.log("STK500 initialize()");
		STK500.currentState = this.states.INITIALIZING;
		
		// this setTimeout stuff is pretty ghetto, but its the only way to have "sleeping"
		setTimeout(function() {
			// object is used literally instead of "this", when using timeout callbacks
			STK500.setDTR_RTS(false);
		
			setTimeout(function() {
				STK500.setDTR_RTS(true);
			
				setTimeout(function() {
					STK500.flush();
				
					// get in sync
					var buffer = [STK500.constants.STK_GET_SYNC, STK500.constants.CRC_EOP];
				
					// update our currentCommand to GET_SYNC
					STK500.currentCommand = STK500.constants.STK_GET_SYNC;
				
					// first send and flush a few times (yes.. they actually do this in avrdude...)
					STK500.send(buffer);
					STK500.flush();
					STK500.send(buffer);
					STK500.flush();
				
					STK500.portReadReady(); // now we care about read callbacks
				
					// update our state
					STK500.currentState = STK500.states.WAITING;
					
					// send the sync request for the last time, and wait for the recieve callback to fire
					STK500.send(buffer);
				}, 500);
			}, 500);
		}, 500);
	},
	
	flush: function() {
		STK500.portFlush();
	},
	
	setDTR_RTS: function(state) {
		STK500.portSetDTR_RTS(state);
	},
	
	send: function(data) {
		STK500.portSend(data);
	},
	
	recieve: function(data) {
		if (STK500.currentState == STK500.states.INITIALIZING) {
			console.log("STK500 recieve() recieving data in an unready state...");
			return;
		}
		
		// do something with data... this method will be huge initially, then broken up later
		switch (STK500.currentCommand) {
			case STK500.constants.STK_GET_SYNC:
				
				break;
		}
		
		
		
	},

};



// chrome app specific implementation start here

var protocol = STK500;
var serialLogging = true;


console.log("starting up!");

var chromeSerialReadReady = function() {
	if (!protocol.port) {
		console.log("chromeSerialReadReady() called without active port");
		return;
	}
	
	if (serialLogging = true) {
		console.log("chromeSerialReadReady()");
	}
	
	// setup our read callback
	chrome.serial.read(protocol.port.connectionId, 128, chromeSerialRead);
};

var chromeSerialRead = function(readData) {
	if (!protocol.port) {
		console.log("chromeSerialRead() called without active port");
		return;
	}
	
	if (readData && readData.bytesRead > 0 && readData.data) {
		if (serialLogging = true) {
			console.log("chromeSerialRead(): " +  bufferToString(readData.data));
		}
		
		// call the actual protocol recieve method
		protocol.recieve(readData.data);
	}
	
	chrome.serial.read(protocol.port.connectionId, 128, chromeSerialRead);
};

var chromeSerialWrite = function(writeData) {
	if (!protocol.port) {
		console.log("chromeSerialWrite() called without active port");
		return;
	}
	
	if (serialLogging = true) {
		console.log("chromeSerialWrite(): " +  bufferToString(writeData));
	}
	
	// convert array in to a binary array as expected by chrome.serial.write
	var data = new ArrayBuffer(writeData.length);
	var dataView = new Uint8Array(data, 0, writeData.length);
	dataView.set(writeData, 0);
	
	chrome.serial.write(protocol.port.connectionId, data, function() {}); 
};

var chromeSerialFlush = function() {
	if (!protocol.port) {
		console.log("chromeSerialFlush() called without active port");
		return;
	}
	
	if (serialLogging = true) {
		console.log("chromeSerialFlush()");
	}
	
	chrome.serial.flush(protocol.port.connectionId, function() {});
};

var chromeSerialSetDTR_RTS = function(state) {
	if (!protocol.port) {
		console.log("chromeSerialSetDTR_RTS() called without active port");
		return;
	}
	
	if (serialLogging = true) {
		console.log("chromeSerialSetDTR_RTS(): " + state);
	}
	
	chrome.serial.setControlSignals(protocol.port.connectionId, { dtr: state, rts: state}, function() {});
};

var chromeSerialClose = function() {
	if (!protocol.port) {
		console.log("chromeSerialClose() called without active port");
		return;
	}
	
	if (serialLogging = true) {
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
		protocol.portReadReady = chromeSerialReadReady;
		
		// initialize the protocol
		protocol.initialize();
	});
});


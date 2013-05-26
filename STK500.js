function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

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
		STK_READ_OSCCAL_EXT: 	0x78,  // 'x'
		STK_HW_VER: 			0x80,
		STK_SW_MAJOR: 			0x81,
		STK_SW_MINOR: 			0x82,
		STK_LEDS: 				0x83,
		STK_VTARGET: 			0x84,
		STK_VADJUST: 			0x85,
		STK_OSC_PSCALE: 		0x86,
		STK_OSC_CMATCH: 		0x87,
		STK_RESET_DURATION: 	0x88,
		STK_SCK_DURATION: 		0x89
	},
	
	
	// settings
	port:  						false,
	baudrate: 					57600,
	
	stk500_devcode:				0xB2,
	
	maximumSize: 				126976,
	
	pageSize: 					256,
	
	lockBits: 					0x0F,
	unlockBits:					0x3F,
	lowFuses: 					0xF7,
	highFuses: 					0xDA,
	extendedFuses: 				0xF5,
	
		
	// board info
	hardwareVersion: 			0,
	versionMajor: 				0,
	versionMinor: 				0,
	
	signature: 					0,
	
	vTarget: 					0,
	vAdjust: 					0,
	oscPScale: 					0,
	oscCMatch: 					0,
	sckDuration: 				0,
	
	
	// callback holders
	recieveCallback: 			false,
	getParmCallback: 			false,
	initializeCallback: 		false,
	getBoardDetailsCallback:	false,
	
	// methods
	portSend: function(data) { console.log("STK500.portSend needs to be overwritten"); }, // overwrite this method for serial specific implementation
	portFlush: function() { console.log("STK500.portFlush needs to be overwritten"); }, // overwrite this method for serial specific implementation
	portSetDTR_RTS: function() { console.log("STK500.portSetDTR_RTS needs to be overwritten"); }, // overwrite this method for serial specific implementation
	portClose: function() { console.log("STK500.portClose needs to be overwritten"); }, // overwrite this method for serial specific implementation
	portReadCallbackArm: function(dataLen) { console.log("STK500.portReadCallbackArm needs to be overwritten"); }, // overwrite this method for serial specific implementation
	
	
	flush: function() {
		STK500.portFlush();
	},
	
	setDTR_RTS: function(state) {
		STK500.portSetDTR_RTS(state);
	},
	
	send: function(data, recieveCallback) {
		if (typeof recieveCallback == "function") {
			STK500.recieveCallback = recieveCallback;
		}
		
		STK500.portSend(data);
	},
	
	recieve: function(data) {
		if (typeof STK500.recieveCallback == "function") {
			// move method to local scope and reset the callback var
			var callbackHolder = STK500.recieveCallback;
			STK500.recieveCallback = false;
			
			callbackHolder(data);
		} else {
			// global handling of recieved data goes here... i think...
		}
	},
	
	getParm: function(parm, callback) {
		console.log("STK500 getParm(" + parm + ")");
		
		STK500.getParmCallback = callback;
		
		var buffer = new Uint8Array(3);
		buffer[0] = STK500.constants.STK_GET_PARAMETER;
		buffer[1] = parm;
		buffer[2] = STK500.constants.CRC_EOP;
		
		STK500.portReadCallbackArm(3); 
		
		STK500.send(buffer, function(buffer) {
			var data = new Uint8Array(buffer);
						
			if (data[0] == STK500.constants.STK_NOSYNC) {
				console.log("STK500 getParm() no sync");
				return;
			} else if (data[0] != STK500.constants.STK_INSYNC) {
				console.log("STK500 getParm() protocol error,  expect=" + STK500.constants.STK_INSYNC + ", resp=" + data[0]);
				return;
			}
			
			if (typeof STK500.getParmCallback.success == "function") {
				STK500.getParmCallback.success(data[1]);
			}
		});
 		
	},
	
	initialize: function(callback) {
		console.log("STK500 initialize()");
		
		STK500.initializeCallback = callback;
						
		// this setTimeout stuff is pretty ghetto, but its the only way to have "sleeping"
		setTimeout(function() {
			// object is used literally instead of "this", when using timeout callbacks
			STK500.setDTR_RTS(false);
		
			setTimeout(function() {
				STK500.setDTR_RTS(true);
				
				setTimeout(function() {
					// get in sync
					var buffer = new Uint8Array(2);
					buffer[0] = STK500.constants.STK_GET_SYNC;
					buffer[1] = STK500.constants.CRC_EOP;
				
					// first send and flush a few times (yes.. they actually do this in avrdude...)
					STK500.send(buffer);
					STK500.send(buffer);
					
					// enable the serial port read callback, with 2 byte length				
					STK500.portReadCallbackArm(2); 
				
					// send the sync request for the last time, and wait for the recieve callback to fire
					STK500.send(buffer, function(buffer) {
						var data = new Uint8Array(buffer);
						
						if (data[0] != STK500.constants.STK_INSYNC) {
							console.log("STK500 initialize() sync - not in sync: resp=" + data[0]);
							return;
						}
						if (data[1] != STK500.constants.STK_OK) {
							console.log("STK500 initialize() sync - can't communicate with device: resp=" + data[1]);
							return;
						}
						
						
						// making this more like stk500_display for verbosity 
						STK500.getParm(STK500.constants.STK_HW_VER, {
							success: function(data) {
								STK500.hardwareVersion = data;
														
								STK500.getParm(STK500.constants.STK_SW_MAJOR, {
									success: function(data) {
										STK500.versionMajor = data;
							
										STK500.getParm(STK500.constants.STK_SW_MINOR, {
											success: function(data) {
												STK500.versionMinor = data;
												
												// set the initialization parameters
												var buffer = new Uint8Array(22);
												buffer[0] = STK500.constants.STK_SET_DEVICE;
												buffer[1] = STK500.stk500_devcode;
												buffer[2] = 0; /* device revision */
												buffer[3] = 0; /* device supports parallel and serial programming */
												buffer[4] = 0; /* pseudo parallel interface */
												buffer[5] = 1; /* polling supported */
												buffer[6] = 1; /* programming is self-timed */
												buffer[7] = roughSizeOfObject(STK500.lockBits);
												
												// number of fuse bytes
												buffer[8] = 0;
												buffer[8] += roughSizeOfObject(STK500.lowFuses);
												buffer[8] += roughSizeOfObject(STK500.highFuses);
												buffer[8] += roughSizeOfObject(STK500.extendedFuses);
												
												// TODO flash related sizes
												buffer[9]  = 0xff;
											    buffer[10]  = 0xff;
											    buffer[13] = 0;
											    buffer[14] = 0;
											    buffer[17] = 0;
											    buffer[18] = 0;
											    buffer[19] = 0;
											    buffer[20] = 0;
												
												// TODO EEPROM related sizes
												buffer[11] = 0xff;
											    buffer[12] = 0xff;
											    buffer[15] = 0;
											    buffer[16] = 0;
												
												buffer[21] = STK500.constants.CRC_EOP;
												
												// enable the serial port read callback, with 2 byte length				
												STK500.portReadCallbackArm(2); 

												// send the initialization parameters
												STK500.send(buffer, function(buffer) {
													var data = new Uint8Array(buffer);
													
													if (data[0] == STK500.constants.STK_NOSYNC) {
														console.log("STK500 initialize() initialization - no sync");
														return;
													} else if (data[0] != STK500.constants.STK_INSYNC) {
														console.log("STK500 initialize() initialization - protocol error,  expect=" + STK500.constants.STK_INSYNC + ", resp=" + data[0]);
														return;
													}
													
													if (data[1] != STK500.constants.STK_OK) {
														console.log("STK500 initialize() initialization - can't communicate with device: resp=" + data[1]);
														return;
													}
													
													// request program mode
													var buffer = new Uint8Array(2);
													buffer[0] = STK500.constants.STK_ENTER_PROGMODE;
													buffer[1] = STK500.constants.CRC_EOP;
													
													STK500.portReadCallbackArm(2); 

													// send the program mode request
													STK500.send(buffer, function(buffer) {
														var data = new Uint8Array(buffer);
														
														if (data[0] == STK500.constants.STK_NOSYNC) {
															console.log("STK500 initialize() progmode - no sync");
															return;
														} else if (data[0] != STK500.constants.STK_INSYNC) {
															console.log("STK500 initialize() progmode - protocol error,  expect=" + STK500.constants.STK_INSYNC + ", resp=" + data[0]);
															return;
														}

														if (data[1] == STK500.constants.STK_OK) {
															console.log("STK500 initialize() progmode - entered programming mode");
															
															// request signature
															var buffer = new Uint8Array(2);
															buffer[0] = STK500.constants.STK_READ_SIGN;
															buffer[1] = STK500.constants.CRC_EOP;
															
															STK500.portReadCallbackArm(5); 

															// send the signature request
															STK500.send(buffer, function(buffer) {
																var data = new Uint8Array(buffer);
																
																if (data[0] == STK500.constants.STK_NOSYNC) {
																	console.log("STK500 initialize() signature - no sync");
																	return;
																} else if (data[0] != STK500.constants.STK_INSYNC) {
																	console.log("STK500 initialize() signature - protocol error,  expect=" + STK500.constants.STK_INSYNC + ", resp=" + data[0]);
																	return;
																}
																
																if (data[4] != STK500.constants.STK_OK) {
																	console.log("STK500 initialize() signature - can't communicate with device: resp=" + data[1]);
																	return;
																}
																
																STK500.signature = [data[1], data[2], data[3]];
																
																if (typeof STK500.initializeCallback.success == "function") {
																	STK500.initializeCallback.success({"hardwareVersion": STK500.hardwareVersion, "versionMajor": STK500.versionMajor, "versionMinor": STK500.versionMinor, "signature": STK500.signature});
																}
																
															});
															
															
															
															return;
														} else if (data[1] == STK500.constants.STK_NODEVICE) {
															console.log("STK500 initialize() no device!");
															return;
														} else if (data[1] == STK500.constants.STK_FAILED) {
															console.log("STK500 initialize() failed to enter programming mode");
															return;
														} else {
															console.log("STK500 initialize() unknown response: " . data[1]);
															return;
														}
														
														
													}); // send
												}); // send
											}
										}); // STK_SW_MINOR
									}
									
								}); // STK_SW_MAJOR
							}
							
						}); // STK_HW_VER
						
					}); // send
					
				}, 500);
			}, 500);
		}, 500);
	},

	getBoardDetails: function(callback) {
		console.log("STK500 getBoardDetails()");
		
		STK500.getBoardDetailsCallback = callback;
		
		STK500.getParm(STK500.constants.STK_VTARGET, {
			success: function(data) {
				console.log("vTarget: " + data);
				
				STK500.vTarget = data;
				
				STK500.getParm(STK500.constants.STK_VADJUST, {
					success: function(data) {
						console.log("vAdjust: " + data);
						
						STK500.vAdjust = data;
						
						STK500.getParm(STK500.constants.STK_OSC_PSCALE, {
							success: function(data) {
								console.log("oscPScale: " + data);
								
								STK500.oscPScale = data;

								STK500.getParm(STK500.constants.STK_OSC_CMATCH, {
									success: function(data) {
										console.log("oscCMatch: " + data);
										
										STK500.oscCMatch = data;

										STK500.getParm(STK500.constants.STK_SCK_DURATION, {
											success: function(data) {
												console.log("sckDuration: " + data);
												
												STK500.sckDuration = data;
												
												/* 
												NEED TO IMPLEMENT THIS ONCE I GET SOME VALID DATA BACK... *scratches head*
												f (osc_pscale == 0)
												    fprintf(stderr, "Off\n");
												  else {
												    int prescale = 1;
												    double f = STK500_XTAL / 2;
												    const char *unit;

												    switch (osc_pscale) {
												      case 2: prescale = 8; break;
												      case 3: prescale = 32; break;
												      case 4: prescale = 64; break;
												      case 5: prescale = 128; break;
												      case 6: prescale = 256; break;
												      case 7: prescale = 1024; break;
												    }
												    f /= prescale;
												    f /= (osc_cmatch + 1);
												    if (f > 1e6) {
												      f /= 1e6;
												      unit = "MHz";
												    } else if (f > 1e3) {
												      f /= 1000;
												      unit = "kHz";
												    } else
												      unit = "Hz";
												    fprintf(stderr, "%.3f %s\n", f, unit);
												  }
												  fprintf(stderr, "%sSCK period      : %.1f us\n", p, 
													  sck_duration * 8.0e6 / STK500_XTAL + 0.05);
													
												*/
												
												
												if (typeof STK500.getBoardDetailsCallback.success == "function") {
													STK500.getBoardDetailsCallback.success();
												}
											}
										}); // STK_SCK_DURATION
									}
								}); // STK_OSC_CMATCH
							}
						}); // STK_OSC_PSCALE
					}
				}); // STK_VADJUST
			}
		}); // STK_VTARGET
		
		
		
	},
};
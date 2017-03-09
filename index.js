'use strict';

var Accessory, Service, Characteristic;
var meoConfig;
var meo = require('meo-controller');

module.exports = function(homebridge) {
	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	var inherits = require('util').inherits;

	//	Create the characteristic for the channel number.
	// Characteristic.ChannelNumber = function() {
	// 	Characteristic.call(this, 'Channel Number','1');
	// 	this.setProps({
	// 		format: Characteristic.Formats.INT,
	// 		unit: Characteristic.Units.NONE,
	// 		maxValue: 999,
	// 		minValue: 0,
	// 		minStep: 1,
	// 		perms: [Characteristic.Perms.WRITE]
	// 	});
	// 	this.value = this.getDefaultValue();
	// };
	// inherits(Characteristic.ChannelNumber, Characteristic);
		
	homebridge.registerAccessory("homebridge-meobox", "MeoBox", MeoBoxAccessory);
}

function MeoBoxAccessory(log, config, api) {
	meoConfig = this.config = config;
	this.name = config.name || 'Meo Box';
	
}

//	Create custom characteristic.




MeoBoxAccessory.prototype = {
	setPowerState: function(powerOn, callback) {
		meo(meoConfig.ipAddress, function(err, api) {
			if (err) {
				console.log(err);
			} else {
				if(!powerOn)
					api.sendKey('power');
			}
			callback();
			api.close();
		});
	},
	
	getPowerState: function(callback) {
		// I'm not sure if this works.
		meo(meoConfig.ipAddress, function(err, api) {
			if(err)
				callback(null, false);
			else
				callback(null, true);
			api.close();
		});
	},
	
	setChannelNumber: function(channel, callback) {
		console.log('Turning channel to ' + channel);
		meo(meoConfig.ipAddress, function(err, api) {
			if (err) {
				console.log(err);
			} else {
				api.sendNum(channel);
			}
			callback();
			api.close();
		});
	},
	
	getServices: function() {
		var informationService;
		
		informationService = new Service.AccessoryInformation()
        			.setCharacteristic(Characteristic.Manufacturer, 'Meo')
        			.setCharacteristic(Characteristic.Model, 'Meo Box HD')
        			.setCharacteristic(Characteristic.SerialNumber, '');	

		var switchService = new Service.Switch(this.name);

		//	Control the box power status.
		switchService.getCharacteristic(Characteristic.On).on('set', this.setPowerState.bind(this));
		switchService.getCharacteristic(Characteristic.On).on('get', this.getPowerState.bind(this));
		
		//	Control the box channel.
		// switchService.addCharacteristic(Characteristic.ChannelNumber);
		// switchService.getCharacteristic(Characteristic.ChannelNumber)
		// 			 .on('set', this.setChannelNumber.bind(this));

		return [switchService, informationService];
	}
}
'use strict';

var Accessory, Service, Characteristic;
var meo = require('meo-controller');

module.exports = function(homebridge) {
	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	var inherits = require('util').inherits;

	//	Create the characteristic for the channel number.
	Characteristic.ChannelNumber = function() {
		Characteristic.call(this, 'Channel Number','1');
		this.setProps({
			format: Characteristic.Formats.INT,
			unit: Characteristic.Units.NONE,
			maxValue: 999,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.ChannelNumber, Characteristic);
		
	homebridge.registerAccessory("homebridge-meobox", "MeoBox", MeoBoxAccessory);
}

function MeoBoxAccessory(log, config, api) {
	this.log = log;
	this.config = config;
	this.name = config.name || 'Meo Box';
	
}

//	Create custom characteristic.




MeoBoxAccessory.prototype = {
	setPowerState: function(powerOn, callback) {
		meo(this.config.ipAddress, function(err, api) {
			if (err) {
				console.log(err);
				this.log(err);
			} else {
				api.sendKey('power');
			}
			callback();
		});
		// if (powerOn && !meoBox.checkPowerState())
		// {
		// 	meoRemote.press('power');
		// }
		// else if (!powerOn && meoBox.checkPowerState())
		// {
		// 	meoRemote.press('power');
		// }
		callback();
	},
	
	getPowerState: function(callback) {
		// I'm not sure if this works.
		meo(this.config.ipAddress, function(err, api) {
			if(err)
				callback(null, false);
			else
				callback(null, true);
		});
	},
	
	setChannelNumber: function(channel, callback) {
		this.log('Turning channel to ' + channel);
		console.log('Turning channel to ' + channel);
		meo(this.config.ipAddress, function(err, api) {
			if (err) {
				this.log(err);
				console.log(err);
			} else {
				api.sendNum(channel);
			}
			callback();
		});
	},
	
	getServices: function() {
		var informationService;
		
		informationService = new Service.AccessoryInformation()
        			.setCharacteristic(Characteristic.Manufacturer, 'Meo')
        			.setCharacteristic(Characteristic.Model, 'Meo Box HD')
        			.setCharacteristic(Characteristic.SerialNumber, '');	
		

		meo(this.config.ipAddress, function(err, api) {
			if (err) {
				console.log(err);
				this.log(err);
			} else {
				this.log('Connected to Meo box ' + this.config.ipAddress);
				console.log('Connected to Meo box ' + this.config.ipAddress);
			}
			callback();
		});

		var switchService = new Service.Switch(this.name);

		//	Control the box power status.
		switchService.getCharacteristic(Characteristic.On).on('set', this.setPowerState.bind(this));
		switchService.getCharacteristic(Characteristic.On).on('get', this.getPowerState.bind(this));
		
		//	Control the box channel.
		switchService.addCharacteristic(Characteristic.ChannelNumber);
		switchService.getCharacteristic(Characteristic.ChannelNumber)
					 .on('set', this.setChannelNumber.bind(this));

		return [switchService, informationService];
	}
}
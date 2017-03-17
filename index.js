'use strict';

var Accessory, Service, Characteristic, meoConfig, 
	meo = require('meo-controller'),
	request = require('request'),
	crypto = require('crypto'),
	parseString = require('xml2js').parseString;

module.exports = function(homebridge) {
	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	var inherits = require('util').inherits;
	
	homebridge.registerAccessory("homebridge-meobox", "MeoBox", MeoBoxAccessory);
}

function MeoBoxAccessory(log, config, api) {
	meoConfig = this.config = config;
	this.name = config.name || 'Meo Box';
	
}

MeoBoxAccessory.prototype = {
	setPowerState: function(powerOn, callback) {
		meo(meoConfig.ip, function(err, api) {
			if (err) {
				console.log(err);
			} else {
				api.sendKey('power');
			}
			if(api.close)
				api.close();
			callback();
		});
	},
	
	getPowerState: function(callback) {
		// Hardcore stuff happening here - it was quite tricky, took about an hour to find a way to get the true box power state cause it's always on.
		meo(meoConfig.ip, function(err, api) {
			console.info("[Meo Box] Checking if box "+meoConfig.ip+" is online.");
			if (err) {
				callback(null, false);
			} else {
				var onFinished = function(status) {
					if(api.close)
						api.close();
					callback(null, status);
				}

				var timestamp = (+new Date());
				var sURL = 'page:http://nowonmytv.app.iptv.telecom.pt/NowOnMyTV.aspx?accountId=$(acct)&deviceId=$(dev)&launchorig=MeoRemote.Android&requestId='+timestamp;
				var token = crypto.createHash('md5').update(timestamp + meoConfig.deviceId + sURL + "8767sfhdu3#189v").digest("hex"); // No comments.

				request({
				  url: 'http://remote-rose.app.iptv.telecom.pt/set.ashx?action='+encodeURIComponent(sURL).replace(/\(/g,"%28").replace(/\)/g,"%29")+'&type=MESSAGE-WRITE&application=remote-android&version=3&guid='+meoConfig.deviceId+'&n='+timestamp+'&tok='+token,
				  headers: {
				  	'Accept': '*/*',
				    'User-Agent': 'MEO Go/201607131100 CFNetwork/808.1.4 Darwin/16.1.0',
				    'Accept-Language': 'pt-pt',
				    'Accept-Encoding': 'gzip, deflate',
				    'Connection': 'keep-alive'
				  }
				}, function(error, response, body) {
					if(!error) {
						parseString(body, function (err, result) {
						    if(!err && result.result && result.result.code && result.result.code.length == 1 && result.result.code[0] == '200') {
						    	function updateChannel(i){
						    		if(i >= 2) {
						    			console.info("Offline");
										return onFinished(false); // Max reached - offline.
						    		} else {
										api.sendNum(237);
										request({
											  url: 'http://nowonmytv.app.iptv.telecom.pt/NowOnMyTVUpdater.ashx?mode=get&accountId=$(acct)&deviceId='+meoConfig.deviceId+'&launchorig=MeoRemote.Android&requestId='+timestamp,
											  headers: {
											  	'Accept': '*/*',
											    'User-Agent': 'MEO Go/201607131100 CFNetwork/808.1.4 Darwin/16.1.0',
											    'Accept-Language': 'pt-pt',
											    'Accept-Encoding': 'gzip, deflate',
											    'Connection': 'keep-alive'
											  }
										}, function(error, response, body) {
											if(!error) {
												parseString(body, function (err, result) {
												    if(!err && result.NowOnTV && result.NowOnTV.RequestId && result.NowOnTV.StationShortName) {
												    	// Connected
														onFinished(true);
													} else {
														setTimeout(function(){
															updateChannel(i+1);
														}, 2000);
													}
												});
											} else {
												setTimeout(function(){
													updateChannel(i+1);
												}, 2000);
											}
										});
									}
								}
								setTimeout(function(){
									updateChannel(0);
								}, 500);
							} else {
								onFinished(false);
							}
						});
					} else {
						onFinished(false);
					}
				});
			}
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
		
		return [switchService, informationService];
	}
}
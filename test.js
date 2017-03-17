/*
GET /NowOnMyTVUpdater.ashx?mode=get&accountId=$(acct)&deviceId=5be10a6d-6ba3-46d8-a4c8-2915ea6da058&launchorig=meogo-ios&requestId=1489757170237 HTTP/1.1
Host: nowonmytv.app.iptv.telecom.pt
Accept: all/all
User-Agent: MEO%20Go/201607131100 CFNetwork/808.1.4 Darwin/16.1.0
Accept-Language: pt-pt
Accept-Encoding: gzip, deflate
Connection: keep-alive

GET  HTTP/1.1
Host: remote-rose.app.iptv.telecom.pt
Accept: all/all
User-Agent: MEO%20Go/201607131100 CFNetwork/808.1.4 Darwin/16.1.0
Accept-Language: pt-pt
Accept-Encoding: gzip, deflate
Connection: keep-alive



GET /NowOnMyTVUpdater.ashx?mode=get&accountId=$(acct)&deviceId=0302ade6-dc66-4e7d-b650-bf779da0406c&launchorig=meogo-ios&requestId=1489757172382 HTTP/1.1
Host: nowonmytv.app.iptv.telecom.pt
Accept: all/all
User-Agent: MEO%20Go/201607131100 CFNetwork/808.1.4 Darwin/16.1.0
Accept-Language: pt-pt
Accept-Encoding: gzip, deflate
Connection: keep-alive
*/

var request = require('request'),
	crypto = require('crypto'),
	parseString = require('xml2js').parseString;
var meo = require('meo-controller');

var boxId = "5be10a6d-6ba3-46d8-a4c8-2915ea6da058";
var timestamp = (+new Date());
var sURL = 'page:http://nowonmytv.app.iptv.telecom.pt/NowOnMyTV.aspx?accountId=$(acct)&deviceId=$(dev)&launchorig=MeoRemote.Android&requestId='+timestamp;
var token = crypto.createHash('md5').update(timestamp + boxId + sURL + "8767sfhdu3#189v").digest("hex");

meo('192.168.1.64', function(err, api) {
	if (err) {
		console.log(err);
	} else {
		var onFinished = function() {
			if(api.close)
				api.close();
		}
	}
	console.info('http://remote-rose.app.iptv.telecom.pt/set.ashx?action='+encodeURIComponent(sURL).replace(/\(/g,"%28").replace(/\)/g,"%29")+'&type=MESSAGE-WRITE&application=remote-android&version=3&guid='+boxId+'&n='+timestamp+'&tok='+token);
	request({
	  url: 'http://remote-rose.app.iptv.telecom.pt/set.ashx?action='+encodeURIComponent(sURL).replace(/\(/g,"%28").replace(/\)/g,"%29")+'&type=MESSAGE-WRITE&application=remote-android&version=3&guid='+boxId+'&n='+timestamp+'&tok='+token,
	  headers: {
	  	'Accept': '*/*',
	    'User-Agent': 'MEO Go/201607131100 CFNetwork/808.1.4 Darwin/16.1.0',
	    'Accept-Language': 'pt-pt',
	    'Accept-Encoding': 'gzip, deflate',
	    'Connection': 'keep-alive'
	  }
	}, function(error, response, body) {
		parseString(body, function (err, result) {
		    if(!err && result.result && result.result.code && result.result.code.length == 1 && result.result.code[0] == '200') {
		    	function updateChannel(i){
		    		if(i >= 2) {
		    			console.info("Offline");
						onFinished();
		    			return; // Max reached - offline.
		    		}
					api.sendNum(237);
					request({
						  url: 'http://nowonmytv.app.iptv.telecom.pt/NowOnMyTVUpdater.ashx?mode=get&accountId=$(acct)&deviceId='+boxId+'&launchorig=MeoRemote.Android&requestId='+timestamp,
						  headers: {
						  	'Accept': '*/*',
						    'User-Agent': 'MEO Go/201607131100 CFNetwork/808.1.4 Darwin/16.1.0',
						    'Accept-Language': 'pt-pt',
						    'Accept-Encoding': 'gzip, deflate',
						    'Connection': 'keep-alive'
						  }
					}, function(error, response, body) {
						parseString(body, function (err, result) {
							console.info(result);
						    if(!err && result.NowOnTV && result.NowOnTV.RequestId && result.NowOnTV.StationShortName) {
						    	// Connected
								onFinished();
							} else {
								setTimeout(function(){
									updateChannel(i+1);
								}, 2000);
							}
						});
					});
				};
				setTimeout(function(){
					updateChannel(0);
				}, 500);
			} else {
				onFinished();
			}
		});
	});
});



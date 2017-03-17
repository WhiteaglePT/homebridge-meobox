# homebridge-meobox
Homebridge plugin for configuring the meo box

## Summary
This plugin is based on [shauncampbell's homebridge-sky-plus-hd Node.js library](https://github.com/shauncampbell/homebridge-sky-plus-hd) and [JosePedroDias's meo-controller Node.js library](https://github.com/JosePedroDias/meo-controller). Of course the meo box has less functionality than the sky plus box....


## Features

* Switch on and off the Meo Box
* Change Channels

It would be nice to have more features - help is welcome.

## Installation

1. Install homebridge using the instructions on the [Homebridge github page](https://github.com/nfarina/homebridge).
2. Install this plugin using the command: 
~~~
npm install -g homebridge-meobox
~~~
3. Update your configuration file to include the following section:
~~~
"accessories": [
  {
    "accessory": "MeoBox",
    "name": "Meo Box",
    "ip": "192.168.1.64",
    "deviceId": "00000000-0000-0000-0000-000000000000"
  }
]
~~~

The `accessory` must be `MeoBox` for the plugin to work.
You can set the `name` parameter to anything you like. The `ip` parameter should point to your Meo Box, the "deviceId" (and IP) can be found on the box menu's by going to the last menu, last option - the deviceId is on the field "ID MEOBox".
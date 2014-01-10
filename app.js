/**
 * Module dependencies.
 */
var config = require('config');
var express = require('express');
var clim = require("clim");
var console = clim();
var RasterizerService = require('./lib/rasterizerService');
var RedisService = require('./lib/redisService');

process.on('uncaughtException', function (err) {
  console.error("[uncaughtException]", err);
  process.exit(1);
});

process.on('SIGTERM', function () {
  process.exit(0);
});

process.on('SIGINT', function () {
  process.exit(0);
});

// web service
var app = express();
var redisService = new RedisService(config.redis).startService(function(data){
	app.configure(function(){
	  app.use(app.router);
	  app.set('redisService', redisService);
	  for (var i = 0; i < config.rasterizer.num; i++){
	  	app.set('rasterizerService_' + (config.rasterizer.port + i), new RasterizerService(config.rasterizer, config.rasterizer.port + i).startService(redisService));
	  }
	});
	app.configure('development', function() {
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});
	require('./routes')(app, config.server);
	app.listen(config.server.port);
	console.log('Express server listening on port ' + config.server.port);
});

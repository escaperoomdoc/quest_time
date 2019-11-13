const http = require('http');
const express = require("express");
const cors = require('cors');
const config = require('./config.json');
const publicapp = require('./publicapp');
const queenbridge = require('./queenbridge');
var io = require('socket.io-client')("http://dsi.su:3030");

// init app, HTTP server and static recourses
const app = express();
app.use(express.json());
app.use(cors());
publicapp(app, config);
app.use(express.static('public'));

// start http server
var httpServer = http.createServer(app);
httpServer.listen(config.settings.httpPort, () => {});

console.log(`quest time business logic process started on ${config.settings.httpPort}...`);

qb = new queenbridge.QueenBridge(io, config.settings.queenbridgeUrl, {
	id: "bpm_time",
	keepOffline: 10000,
	override: true
});

qb.on('connect', function() {
	console.log('connected');
});
qb.on('disconnect', function() {
	console.log('disconnected');
});
qb.on('receive', function(data) {
	console.log(data);
});

qb.on('register', function() {
	qb.topic('/time/businesslogic');
	qb.subscribe('/time/businesslogic');
});

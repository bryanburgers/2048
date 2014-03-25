"use strict";

var Game = require('./game');
var Player = require('./player');

var game = new Game(Player.corner);
game.on('moved', function(data) {
	console.log();
	console.log("Points: " + data.points);
	console.log(data.board.toString());
});
game.on('end', function(data) {
	console.log();
	console.log("Points: " + data.points);
	console.log(data.board.toString());
});

game.start();

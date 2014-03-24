"use strict";

var assert = require('assert');
var Game = require('../game');
var Direction = require('../direction');
var Board = require('../board');

describe('game', function() {

	it('calls out to the player', function(done) {
		var player = {
			requestMove: function(board, callback) {
				done();
			}
		};

		var game = new Game(player);
		game.start();
	});

	it('calls out to the player multiple times', function(done) {
		var player = {
			called: 0,
			requestMove: function(board, callback) {
				if (this.called === 0) {
					this.called++;
					callback(null, Direction.LEFT);
				}
				else {
					// Called a second time.
					done();
				}
			}
		};

		var game = new Game(player);
		game.start();
	});

	it('emits events', function(done) {
		var player = {
			called: 0,
			requestMove: function(board, callback) {
				if (this.called === 0) {
					this.called++;
					callback(null, Direction.LEFT);
				}
				else {
					// Don't do anything.
				}
			}
		};

		var game = new Game(player);
		game.start();
		game.on('moved', function(data) {
			data.should.have.property('board');
			data.should.have.property('points');
			done();
		});
	});

	it('stops the game if there are no more moves', function(done) {
		var player = {
			called: 0,
			requestMove: function(board, callback) {
				if (this.called === 0) {
					this.called++;
					callback(null, Direction.LEFT);
				}
				else {
					throw new Error("player.requestMove should not have been called a second time.");
				}
			}
		};

		// A board that, after doing a move(Direction.LEFT), will necessarily
		// be an end of game.
		var board = Board.fromArray([
			 0,  8, 16,  8,
			32, 64, 32, 64,
			64, 32, 64, 32,
			32, 64, 32, 64
		]);

		var game = new Game(player, board);
		game.start();
		game.on('end', function(data) {
			data.should.have.property('board');
			data.should.have.property('points');
			done();
		});
	});

	it('stops the game if the player returns an error', function(done) {
		var player = {
			called: 0,
			requestMove: function(board, callback) {
				if (this.called === 0) {
					this.called++;
					callback(new Error("Intentional error"), null);
				}
				else {
					throw new Error("player.requestMove should not have been called a second time.");
				}
			}
		};

		var game = new Game(player);
		game.start();
		game.on('end', function(data) {
			data.should.have.property('board');
			data.should.have.property('points');
			done();
		});
	});
});

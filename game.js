"use strict";

var assert = require('assert');
var Direction = require('./direction');
var Board = require('./board');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Game(player, board) {
	EventEmitter.call(this);

	this.player = player;
	this.points = 0;
	this.board = board;
}

util.inherits(Game, EventEmitter);

Game.prototype.start = function start() {
	var self = this;
	if (this.board == null) {
		this.board = Board.empty;
		this._placeRandomTile();
		this._placeRandomTile();
	}
	process.nextTick(function() {
		self._perform();
	});
};

Game.prototype._placeRandomTile = function _placeRandomTile() {
	var value = Math.random() < 0.9 ? 2 : 4;
	var position = Board.randomBlank(this.board);
	this.board = this.board.set(position.x, position.y, value);
};

Game.prototype._perform = function _perform() {
	var self = this;

	setTimeout(function() {
		self.player.requestMove(self.board, function(err, direction) {
			if (err) {
				self._endGame();
				return;
			}

			var moveResult = self.board.move(direction);
			self.board = moveResult.board;
			self.points += moveResult.points;

			self.emit('moved', {
				board: self.board,
				points: self.points
			});

			self._placeRandomTile();

			if (!self.board.canMove(Direction.UP)
				&& !self.board.canMove(Direction.DOWN)
				&& !self.board.canMove(Direction.LEFT)
				&& !self.board.canMove(Direction.RIGHT)) {

				self._endGame();
				return;
			}

			self._perform();
		});
	}, 0);
};

Game.prototype._endGame = function _endGame() {
	this.emit('end', {
		board: this.board,
		points: this.points
	});
};

module.exports = Game;

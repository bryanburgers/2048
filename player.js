"use strict";

var Q = require('q');
var Direction = require('./direction');
var Board = require('./board');

function Player(searchDepth, boardEvaluator) {
	this.searchDepth = searchDepth;
	this.boardEvaluator = boardEvaluator;
}

Player.prototype.bestMove = function bestMove(count, board) {
	var self = this;
	if (count === 0) {
		return Q.Promise(function(resolve, reject) {
			var up =    board.canMove(Direction.UP)    ? self.boardEvaluator(board.move(Direction.UP))    : -1;
			var down =  board.canMove(Direction.DOWN)  ? self.boardEvaluator(board.move(Direction.DOWN))  : -1;
			var left =  board.canMove(Direction.LEFT)  ? self.boardEvaluator(board.move(Direction.LEFT))  : -1;
			var right = board.canMove(Direction.RIGHT) ? self.boardEvaluator(board.move(Direction.RIGHT)) : -1;

			var max = Math.max(up, down, left, right);

			if (up === max) {
				return resolve({ points: max, direction: Direction.UP });
			}
			if (down === max) {
				return resolve({ points: max, direction: Direction.DOWN });
			}
			if (left === max) {
				return resolve({ points: max, direction: Direction.LEFT });
			}
			if (right === max) {
				return resolve({ points: max, direction: Direction.RIGHT });
			}

			reject("Could not choose a best move.");
		});
	}
	else {
		var up    = self.calculateRandom(count - 1, board.move(Direction.UP));
		var down  = self.calculateRandom(count - 1, board.move(Direction.DOWN));
		var left  = self.calculateRandom(count - 1, board.move(Direction.LEFT));
		var right = self.calculateRandom(count - 1, board.move(Direction.RIGHT));

		var best = Q.all([up, down, left, right]);

		return best.then(function(arr) {
			var up = arr[0];
			var down = arr[1];
			var left = arr[2];
			var right = arr[3];

			var max = Math.max(up, down, left, right);

			if (up === max) {
				return { points: up, direction: Direction.UP };
			}
			if (down === max) {
				return { points: down, direction: Direction.DOWN };
			}
			if (left === max) {
				return { points: left, direction: Direction.LEFT };
			}
			if (right === max) {
				return { points: right, direction: Direction.RIGHT };
			}

			throw new Error("Didn't select a best move.");
		});
	}
};

Player.prototype.calculateRandom = function calculateRandom(count, obj) {
	var self = this;

	var items = [];

	var board = obj.board;
	var points = obj.points;

	for (var x = 0; x <= 3; x++) {
		for (var y = 0; y <= 3; y++) {
			if (board.get(x, y) === 0) {
				// This should be a weighted average of 2 and 4.
				var two = self.bestMove(count, board.set(x, y, 2));
				var four = self.bestMove(count, board.set(x, y, 4));

				var combined = Q.all([two, four]);
				var weighted = combined.spread(function(two, four) {
					return two.points * 0.9 + four.points * 0.1;
				});

				items.push(weighted);
			}
		}
	}

	var all = Q.all(items);
	return all.then(function(results) {
		var length = results.length;

		if (length === 0) {
			return 0;
		}

		var sum = 0;
		for (var i = 0; i < length; i++) {
			sum += results[i];
		}
		return sum/length;
	});
};

Player.prototype.requestMove = function requestMove(board, callback) {
	var self = this;
	var best = self.bestMove(self.searchDepth, board);

	best.then(function(r) {
		callback(null, r.direction);
	}, function(e) {
		callback(e);
	});
};

Player.create = function(searchDepth, boardEvaluator) {
	return new Player(searchDepth, boardEvaluator);
};

/* Specific players */

Player.naive0 = Player.create(0, function evaluateNaive(moveResult) {
	var blanks = Board.findBlanks(moveResult.board);
	return blanks.length;
});
Player.naive1 = Player.create(1, Player.naive0.boardEvaluator);
Player.naive  = Player.create(2, Player.naive0.boardEvaluator);

Player.basic = Player.create(2, function evaluateBasic(moveResult) {
	var blanks = Board.findBlanks(moveResult.board);

	// How many points we get on this move, plus a weighted value of how many
	// blanks are still available to us.
	return moveResult.points + blanks.length * 511;
});

// A player that likes the largest blocks on the edges
Player.edge = Player.create(2, function evaluateEdge(moveResult) {
	var board = moveResult.board;
	var blanks = Board.findBlanks(board);

	var largestOnEdge = 0;
	for (var x = 0; x <= 3; x++) {
		var max = 0;
		for (var y = 0; y <= 3; y++) {
			max = Math.max(max, board.get(x, y));
		}
		if (max !== 0 && max == board.get(x, 0) || max == board.get(x, 3)) {
			largestOnEdge++;
		}
	}

	for (var y = 0; y <= 3; y++) {
		var max = 0;
		for (var x = 0; x <= 3; x++) {
			max = Math.max(max, board.get(x, y));
		}
		if (max !== 0 && max == board.get(0, y) || max == board.get(0, y)) {
			largestOnEdge++;
		}
	}

	// How many points we get on this move, plus a weighted value of how many
	// blanks are still available to us.
	return moveResult.points + blanks.length * 511 + largestOnEdge * 511;
});

// A player that likes the largest blocks on the edges, and the largest block
// in the corner.
Player.corner = Player.create(2, function evaluateCorner(moveResult) {
	var board = moveResult.board;
	var blanks = Board.findBlanks(board);

	var largestOnEdge = 0;
	for (var x = 0; x <= 3; x++) {
		var max = 0;
		for (var y = 0; y <= 3; y++) {
			max = Math.max(max, board.get(x, y));
		}
		if (max !== 0 && max == board.get(x, 0) || max == board.get(x, 3)) {
			largestOnEdge++;
		}
	}

	for (var y = 0; y <= 3; y++) {
		var max = 0;
		for (var x = 0; x <= 3; x++) {
			max = Math.max(max, board.get(x, y));
		}
		if (max !== 0 && max == board.get(0, y) || max == board.get(0, y)) {
			largestOnEdge++;
		}
	}

	var totalMax = Board.findMaximumValue(board);

	if (totalMax === board.get(0, 0)
		|| totalMax === board.get(0, 3)
		|| totalMax === board.get(3, 0)
		|| totalMax === board.get(3, 3)) {
		largestOnEdge += 8;
	}

	// How many points we get on this move, plus a weighted value of how many
	// blanks are still available to us.
	return moveResult.points + blanks.length * 511 + largestOnEdge * 511;
});

module.exports = Player;

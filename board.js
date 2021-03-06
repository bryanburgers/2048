"use strict";

var assert = require('assert');
var Direction = require('./direction');

function Board() {
	this._values = [0, 0, 0, 0,
	                0, 0, 0, 0,
	                0, 0, 0, 0,
	                0, 0, 0, 0];
	this._moveCache = {
	};
}

exports.fromArray = function(values) {
	assert(values.length === 16, "Number of values in the array equals 16");

	var board = new Board();
	board._values = values;
	return board;
};

Board.prototype._createFromArray = function _createFromArray(values) {
	assert(values.length === 16, "Number of values in the array equals 16");
	var board = new Board();
	board._values = values;
	return board;
};

Board.prototype.get = function get(x, y) {
	return this._values[y * 4 + x];
};

Board.prototype.set = function set(x, y, value) {
	var newValues = this._values.slice(0);
	this._put(x, y, value, newValues);
	return this._createFromArray(newValues);
};

Board.prototype._get = function _get(x, y, values) {
	return values[y * 4 + x];
};

Board.prototype._put = function _put(x, y, value, values) {
	values[y * 4 + x] = value;
};

Board.prototype.move = function move(direction) {
	if (this._moveCache[direction]) {
		return this._moveCache[direction];
	}

	switch (direction) {
		case Direction.UP:
		case Direction.DOWN:
			var result = this._moveVertical(direction);
			this._moveCache[direction] = result;
			return result;
		case Direction.LEFT:
		case Direction.RIGHT:
			var result = this._moveHorizontal(direction);
			this._moveCache[direction] = result;
			return result;
		default:
			throw new Error("Unknown direction: " + direction);
	}
};

Board.prototype._moveVertical = function(direction) {
	var newValues = this._values.slice(0);

	var startY = 1;
	var incrementY = 1;
	var defaultLastY = 0;
	var points = 0;
	var moved = false;

	if (direction === Direction.DOWN) {
		startY = 2;
		incrementY = -1;
		defaultLastY = 3;
	}

	for (var x = 0; x <= 3; x++) {
		var lastY = defaultLastY;
		for (var y = startY; 0 <= y && y <= 3; y += incrementY) {
			if (y === lastY) {
				continue;
			}

			var val = this.get(x, y);
			var compare = this._get(x, lastY, newValues);
			if (val === 0) {
				continue;
			}
			if (compare === 0) {
				moved = true;
				this._put(x, lastY, val, newValues);
				this._put(x, y, 0, newValues);
			}
			else if (val === compare) {
				points += val + val;
				moved = true;
				this._put(x, lastY, val + val, newValues);
				this._put(x, y, 0, newValues);
				lastY += incrementY;
			}
			else if (val !== compare) {
				lastY += incrementY;
				y -= incrementY;
			}
		}
	}

	return {
		board: this._createFromArray(newValues),
		points: points,
		moved: moved
	};
};

Board.prototype._moveHorizontal = function(direction) {
	var newValues = this._values.slice(0);

	var startX = 1;
	var incrementX = 1;
	var defaultLastX = 0;
	var points = 0;
	var moved = false;

	if (direction === Direction.RIGHT) {
		startX = 2;
		incrementX = -1;
		defaultLastX = 3;
	}


	for (var y = 0; y <= 3; y++) {
		var lastX = defaultLastX;
		for (var x = startX; 0 <= x && x <= 3; x += incrementX) {
			if (x === lastX) {
				continue;
			}

			var val = this.get(x, y);
			var compare = this._get(lastX, y, newValues);
			if (val === 0) {
				continue;
			}
			if (compare === 0) {
				moved = true;
				this._put(lastX, y, val, newValues);
				this._put(x, y, 0, newValues);
			}
			else if (val === compare) {
				points += val + val;
				moved = true;
				this._put(lastX, y, val + val, newValues);
				this._put(x, y, 0, newValues);
				lastX += incrementX;
			}
			else if (val !== compare) {
				lastX += incrementX;
				x -= incrementX;
			}
		}
	}

	return {
		board: this._createFromArray(newValues),
		points: points,
		moved: moved
	};
};

Board.prototype.canMove = function canMove(direction) {
	var result = this.move(direction);
	return result.moved;
};

Board.prototype.toString = function toString() {
	var s = '';
	for (var y = 0; y <= 3; y++) {
		if (y > 0) {
			s += '\n';
		}

		for (var x = 0; x <= 3; x++) {
			s += ' | ';
			var val = this.get(x, y).toString();
			if (val === '0') {
				val = ' ';
			}
			while (val.length < 5) {
				val = ' ' + val;
			}
			s += val;
		}

		s += ' |';
	}
	return s;
};

exports.findBlanks = function findBlanks(board) {
	var blanks = [];
	for (var y = 0; y <= 3; y++) {
		for (var x = 0; x <= 3; x++) {
			if (board.get(x, y) === 0) {
				blanks.push({ x: x, y: y });
			}
		}
	}
	return blanks;
};

exports.randomBlank = function randomBlank(board) {
	var blanks = exports.findBlanks(board);
	blanks.forEach(function(b) {
		b.r = Math.random();
	});
	blanks.sort(function(a, b) {
		return a.r - b.r;
	});
	delete blanks[0].r;
	return blanks[0];
};

exports.findMaximumValue = function findMaximumValue(board) {
	var max = 0;

	for (var x = 0; x <= 3; x++) {
		for (var y = 0; y <= 3; y++) {
			max = Math.max(max, board.get(x, y));
		}
	}

	return max;
};

exports.empty = exports.fromArray([0, 0, 0, 0,
	0, 0, 0, 0,
	0, 0, 0, 0,
	0, 0, 0, 0]);

"use strict";

var assert = require('assert');
var Board = require('../board');
var Direction = require('../direction');

function boardsEqual(board1, board2, prefix) {
	if (!prefix) {
		prefix = "Boards are equal";
	}
	var differences = [
	];
	for (var x = 0; x <= 3; x++) {
		for (var y = 0; y <= 3; y++) {
			var v1 = board1.get(x, y);
			var v2 = board2.get(x, y);
			if (v1 !== v2) {
				differences.push('  at (' + x + ',' + y + ') expected: ' + v2 + ', actual: ' + v1);
			}
		}
	}
	if (differences.length > 0) {
		assert(false, prefix + '\n' + differences.join('\n'));
	}

}

describe('board', function() {
	it('create a new board and handle the full sized board.', function() {
		var board = new Board();
		board.get(0, 0).should.eql(0);
		board.get(0, 3).should.eql(0);
		board.get(3, 0).should.eql(0);
		board.get(3, 3).should.eql(0);
	});

	it('handles sets properly.', function() {
		var board = new Board().set(0, 0, 2).set(0, 3, 4).set(3, 3, 8);
		board.get(0, 0).should.eql(2);
		board.get(0, 3).should.eql(4);
		board.get(3, 0).should.eql(0);
		board.get(3, 3).should.eql(8);
	});

	it('handles array creation properly.', function() {
		var board = Board.fromArray(
			[2, 0, 0, 0,
			 0, 0, 0, 0,
			 0, 0, 0, 0,
			 4, 0, 0, 8]);
		board.get(0, 0).should.eql(2);
		board.get(0, 3).should.eql(4);
		board.get(3, 0).should.eql(0);
		board.get(3, 3).should.eql(8);
	});

	it('handles UP properly (just move tiles).', function() {
		var source = Board.fromArray(
			[2, 0, 0, 0,
			 0, 0, 0, 2,
			 0, 2, 0, 0,
			 0, 0, 2, 0]);

		var destination = Board.fromArray(
			[2, 2, 2, 2,
			 0, 0, 0, 0,
			 0, 0, 0, 0,
			 0, 0, 0, 0]);

		boardsEqual(source.move(Direction.UP), destination);
	});

	it('handles UP properly (combinations).', function() {
		var source = Board.fromArray(
			[2, 0, 2, 0,
			 2, 2, 0, 0,
			 2, 4, 0, 2,
			 2, 2, 2, 0]);

		var destination = Board.fromArray(
			[4, 2, 4, 2,
			 4, 4, 0, 0,
			 0, 2, 0, 0,
			 0, 0, 0, 0]);

		boardsEqual(source.move(Direction.UP), destination);
	});

	it('handles UP properly (2, 4, 0, 2).', function() {
		var source = Board.fromArray(
			[2, 0, 0, 0,
			 4, 0, 0, 0,
			 0, 0, 0, 0,
			 2, 0, 0, 0]);

		var destination = Board.fromArray(
			[2, 0, 0, 0,
			 4, 0, 0, 0,
			 2, 0, 0, 0,
			 0, 0, 0, 0]);

		boardsEqual(source.move(Direction.UP), destination);
	});

	it('handles UP properly (2, 4, 0, 4).', function() {
		var source = Board.fromArray(
			[2, 0, 0, 0,
			 4, 0, 0, 0,
			 0, 0, 0, 0,
			 4, 0, 0, 0]);

		var destination = Board.fromArray(
			[2, 0, 0, 0,
			 8, 0, 0, 0,
			 0, 0, 0, 0,
			 0, 0, 0, 0]);

		boardsEqual(source.move(Direction.UP), destination);
	});

	it('handles DOWN properly (just move tiles).', function() {
		var source = Board.fromArray(
			[2, 0, 0, 0,
			 0, 0, 0, 2,
			 0, 2, 0, 0,
			 0, 0, 2, 0]);

		var destination = Board.fromArray(
			[0, 0, 0, 0,
			 0, 0, 0, 0,
			 0, 0, 0, 0,
			 2, 2, 2, 2]);

		boardsEqual(source.move(Direction.DOWN), destination);
	});

	it('handles DOWN properly (combinations).', function() {
		var source = Board.fromArray(
			[2, 2, 2, 0,
			 2, 4, 0, 0,
			 2, 2, 0, 2,
			 2, 0, 2, 0]);

		var destination = Board.fromArray(
			[0, 0, 0, 0,
			 0, 2, 0, 0,
			 4, 4, 0, 0,
			 4, 2, 4, 2]);

		boardsEqual(source.move(Direction.DOWN), destination);
	});

	it('handles LEFT properly (just move tiles).', function() {
		var source = Board.fromArray(
			[2, 0, 0, 0,
			 0, 0, 0, 2,
			 0, 2, 0, 0,
			 0, 0, 2, 0]);

		var destination = Board.fromArray(
			[2, 0, 0, 0,
			 2, 0, 0, 0,
			 2, 0, 0, 0,
			 2, 0, 0, 0]);

		boardsEqual(source.move(Direction.LEFT), destination);
	});

	it('handles LEFT properly (combinations).', function() {
		var source = Board.fromArray(
			[2, 0, 2, 0,
			 2, 2, 0, 0,
			 2, 4, 0, 2,
			 2, 2, 2, 0]);

		var destination = Board.fromArray(
			[4, 0, 0, 0,
			 4, 0, 0, 0,
			 2, 4, 2, 0,
			 4, 2, 0, 0]);

		boardsEqual(source.move(Direction.LEFT), destination);
	});

	it('handles RIGHT properly (just move tiles).', function() {
		var source = Board.fromArray(
			[2, 0, 0, 0,
			 0, 0, 0, 2,
			 0, 2, 0, 0,
			 0, 0, 2, 0]);

		var destination = Board.fromArray(
			[0, 0, 0, 2,
			 0, 0, 0, 2,
			 0, 0, 0, 2,
			 0, 0, 0, 2]);

		boardsEqual(source.move(Direction.RIGHT), destination);
	});

	it('handles RIGHT properly (combinations).', function() {
		var source = Board.fromArray(
			[2, 2, 2, 0,
			 2, 4, 0, 0,
			 2, 2, 0, 2,
			 2, 0, 2, 0]);

		var destination = Board.fromArray(
			[0, 0, 2, 4,
			 0, 0, 2, 4,
			 0, 0, 2, 4,
			 0, 0, 0, 4]);

		boardsEqual(source.move(Direction.RIGHT), destination);
	});
});
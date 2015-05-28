(function() {
	//盤モデル
	var Board = (function() {
		//盤全体の穴の状態 6*6行列
		var holes = [
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0]
		];

		var slates = [
			[null, null],
			[null, null]
		];

		function setSlate(x, y, slate) {
			slates[y][x] = slate;
			for(var sy = 0; sy < 3; sy++) {
				for(var sx = 0; sx < 3; sx++) {
					holes[y * 3 + sy][x * 3 + sx] = slate.holes[sy][sx];
				}
			}
		}

		function isHole(x, y) {
			return holes[y][x] == 1;
		}

		function toggleHole(x, y, state) {
			if(state === undefined) {
				state = Math.abs(holes[y][x] - 1); //反転
			}
			if(state === true) {
				state = 1;
			} else if(state === false) {
				state = 0;
			}
			holes[y][x] = state;
		}

		return {
			setSlate: setSlate,
			isHole: isHole,
			toggleHole: toggleHole
		};
	})();

	var SlateTemplate = {
		x: [
			[1, 1, 0],
			[1, 1, 0],
			[0, 0, 0]
		],
		m: [
			[1, 1, 0],
			[0, 0, 0],
			[1, 1, 0]
		],
		k: [
			[1, 1, 0],
			[0, 0, 0],
			[1, 0, 1]
		],
		j: [
			[1, 1, 0],
			[0, 0, 1],
			[0, 1, 0]
		],
		y: [
			[1, 0, 0],
			[0, 1, 1],
			[1, 0, 0]
		],
		l: [
			[1, 0, 0],
			[1, 0, 0],
			[1, 1, 0]
		],
		q: [
			[1, 1, 0],
			[0, 1, 0],
			[0, 1, 0]
		],
		t: [
			[0, 1, 0],
			[0, 1, 1],
			[0, 1, 0]
		],
		h: [
			[1, 0, 0],
			[1, 0, 0],
			[1, 0, 1]
		],
		z: [
			[1, 0, 0],
			[1, 1, 0],
			[0, 1, 0]
		],
		w: [
			[1, 1, 0],
			[0, 0, 1],
			[0, 0, 1]
		],
		n: [
			[1, 1, 0],
			[1, 0, 1],
			[0, 0, 0]
		],
		s: [
			[1, 0, 0],
			[1, 1, 0],
			[0, 0, 1]
		]
	};
	var Slate = function(template) {
		if(template === undefined) {
			this.holes = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			];
		} else {
			this.holes = template;
		}
	};
	Slate.prototype.toggle = function(x, y, state) {
		if(state === undefined) {
			state = Math.abs(this.holes[y][x] - 1); //反転
		}
		if(state === true) {
			state = 1;
		} else if(state === false) {
			state = 0;
		}
		this.holes[y][x] = state;
	};
	Slate.prototype.rotate = function(rightAngles) {
		var newHoles;
		for(var r = 0; r < rightAngles; r++) {
			newHoles = [];
			for(var y = 0; y < 3; y++) {
				newHoles[y] = [];
				for(var x = 0; x < 3; x++) {
					newHoles[y][x] = this.holes[x][2 - y];
				}
			}
			this.holes = newHoles;
		}
		return this;
	};
	Slate.prototype.isHole = function(x, y) {
		return this.holes[y][x] == 1;
	};

	var BoardUI = (function(Board) {
		var $cells = [];
		var slateEntries = [];

		function forEachCell(callback) {
			for(var y = 0; y < 6; y++) {
				for(var x = 0; x < 6; x++) {
					callback(x, y);
				}
			}
		}

		function draw() {
			forEachCell(function(x, y) {
				$cells[y][x].toggleClass('hole', Board.isHole(x, y));
			});
		}

		function appendSlateEntry(slate) {
			var id;
			if(slateEntries.length >= 1) {
				id = slateEntries[slateEntries.length - 1].slateId + 1;
			} else {
				id = 1;
			}
			slate.slateId = id;
			slateEntries.push(slate);

			$newEnt = $('#slate-entry-dummy').clone()
				.attr('id', '')
				.attr('data-slate-id', id)
				.css('display', 'inline-block');
			$newEnt.find('td').each(function() {
				var coord = getCellCoord($(this));
				$(this).toggleClass('hole', slate.isHole(coord[0], coord[1]));
			});
			$newEnt.appendTo('#slate-entries');

			$newEnt.draggable({
				helper: 'clone',
				opacity: 0.5
			});
		}

		function getCellCoord($cell) {
			var x = parseInt($cell.attr('data-x'));
			var y = parseInt($cell.attr('data-y'));
			return [x, y];
		}

		function setup() {
			Board.setSlate(0, 0, new Slate(SlateTemplate.q));
			Board.setSlate(0, 1, new Slate(SlateTemplate.t));
			for(var i = 0; i < setupFunctions.length; i++) {
				setupFunctions[i]();
			}

			draw();

			appendSlateEntry(new Slate(SlateTemplate.z));
			appendSlateEntry(new Slate(SlateTemplate.y).rotate(3));
		}

		var setupFunctions = [
			function() {
				var $boardTable = $('#board-table');
				var $boardRow = $boardTable.find('tr');
				var $boardCol;
				for(var y = 0; y < 6; y++) {
					$cells[y] = [];
					$boardCol = $($boardRow[y]).find('td');
					for(var x = 0; x < 6; x++) {
						$cells[y][x] = $($boardCol[x]);
					}
				}
			},

			function() {
				forEachCell(function(x, y) {
					$cells[y][x].click(function(e) {
						Board.toggleHole(x, y);
						$(this).toggleClass('hole');
					});
				});
			},

			function() {
				$('#slate-acceptor td').each(function() {
					$(this).droppable({
						tolerance: 'intersect',
						hoverClass: 'accepting',
						drop: function(e, ui) {
							var $dropped = $(ui.draggable);
							var coord = getCellCoord($(this));
							var id = parseInt($dropped.attr('data-slate-id'));
							var slate;
							slateEntries.forEach(function(s) {
								if(s.slateId == id) {
									slate = s;
									return;
								}
							});

							Board.setSlate(coord[0], coord[1], slate);
							draw();
						}
					});
				});
			}
		];

		return {
			setup: setup
		};
	})(Board);

	jQuery(function($) {
		BoardUI.setup();

	});
})();

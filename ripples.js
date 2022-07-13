class Tetron {
	constructor ( x , y ) {
		this.x = x ;
		this.y = y ;
	}
	get x () { return this._x }
	set x (x) { this._x = x }
	get y () { return this._y }
	set y (y) { this._y = y }
}
// END CLASS Tetron

class Drop {
	// @param {Tetron} {int} {int}
	constructor ( center , surfaceX , surfaceY ) {
		this.bounds = new Tetron ( surfaceX , surfaceY ) ;
		this.center = center ;
		this.phase = -1 ;
		this.maxPhase = this.calcMaxPhase ( surfaceX , surfaceY ) ;
	}

	get center () { return this._center }
	set center (c) { this._center = c }
	get phase () { return this._phase }
	set phase (ph) { this._phase = ph }
	get maxPhase () { return this._maxPhase }
	set maxPhase (m) { this._maxPhase = m }

	get radius () {
		return ( this.phase === -1 ? 0 : this.phase + 0.5 ) ;
	}

	grow () {
		if ( this.nextPhase() <= this.maxPhase ) {
			return this.ripple() ;
		} else {
			return null ;
		}
	};

	nextPhase () {
		this.phase = this.phase + 1 ;
		return this.phase ;
	};

	calcMaxPhase ( s_xDim , s_yDim ) {
		let maxPhase ;
		let candidate ;
		let xPos = s_xDim - this.center.x ;
		let xNeg = this.center.x ;
		let yPos = s_yDim - this.center.y ;
		let yNeg = this.center.y ;

		maxPhase = Math.ceil ( Math.sqrt ( xPos*xPos + yPos*yPos ) ) ;
		candidate = Math.ceil ( Math.sqrt ( xPos*xPos + yNeg*yNeg ) ) ;
		if ( candidate > maxPhase ) {
			maxPhase = candidate ;
		}
		candidate = Math.ceil ( Math.sqrt ( xNeg*xNeg + yPos*yPos ) ) ;
		if ( candidate > maxPhase ) {
			maxPhase = candidate ;
		}
		candidate = Math.ceil ( Math.sqrt ( xNeg*xNeg + yNeg*yNeg ) ) ;
		if ( candidate > maxPhase ) {
			maxPhase = candidate ;
		}

		return maxPhase ;
	};

	ripple () {
		let r = this.radius ;
		let cX = this.center.x ;
		let cY = this.center.y ;
		// radius from 0 to 45 degrees
		let aLenAtRadius45 = Math.floor( r * Math.sqrt( 0.5 ) ) ;
		// Tetron array
		let tetrons = [] ;

		for ( var a = 0 ; a <= aLenAtRadius45 ; a++ ) {
			var b = this.calc_b ( r,a ) ;
			tetrons.push( new Tetron ( cX+b , cY+a ) ) ;
			tetrons.push( new Tetron ( cX+b , cY-a ) ) ;
			tetrons.push( new Tetron ( cX-b , cY+a ) ) ;
			tetrons.push( new Tetron ( cX-b , cY-a ) ) ;
			tetrons.push( new Tetron ( cX+a , cY+b ) ) ;
			tetrons.push( new Tetron ( cX-a , cY+b ) ) ;
			tetrons.push( new Tetron ( cX+a , cY-b ) ) ;
			tetrons.push( new Tetron ( cX-a , cY-b ) ) ;
		}

		return tetrons ;
	};

	calc_b ( radius , a ) {
		return Math.floor( Math.sqrt( radius*radius - a*a ) ) ;
	};
}
// END CLASS Drop

class Surface {
	constructor ( xDim , yDim ) {
		this.xDim = xDim ;
		this.yDim = yDim ;
		this.grid = this.zState() ;
		this.drops = [] ; // {Drop[]}
	}

	get xDim () { return this._xDim }
	set xDim (x) { this._xDim = x }
	get yDim () { return this._yDim }
	set yDim (y) { this._yDim = y }
	get grid () { return this._grid }
	set grid (g) { this._grid = g }
	get drops () { return this._drops }
	set drops (d) { this._drops = d }

	zState () {
		let zGrid = [] ;
		for ( var i = 0 ; i < this.yDim ; i++ ) {
			let row = [] ;
			for ( var j = 0 ; j < this.xDim ; j++ ) {
				row[j] = 0 ;
			}
			zGrid[i] = row ;
		}
		return zGrid;
	};

	nextState () {
		this.grid = this.zState() ;
		// Reverse for loop to allow changing array (drops) length
		for ( var i = this.drops.length - 1 ; i >= 0 ; i-- ) {
			var dropRipple = this.drops[i].grow() ;
			if ( dropRipple != null )
				{ this.render ( dropRipple ) ; }
			if ( dropRipple = null )
				{ this.removeDrop(i) ; }
		 }
		return ;
	};

	addDrop ( drop ) {
		this.drops.push( drop ) ;
		return ;
	};

	removeDrop ( index ) {
		this.drops.splice( index , 1 ) ;
		return ;
	};

	render ( rippleTetrons ) {
		for ( var i = 0 ; i < rippleTetrons.length ; i++ ) {
			var c = rippleTetrons[i].x ;
			var r = rippleTetrons[i].y ;
			if ( c >= 0 && c < this.xDim && r >= 0 && r < this.yDim ) {
				this.grid[r][c] = 1 ;
			}
		}
		return ;
	};
}
// END CLASS Surface

// XORSHIFT RNG
function xorshRNG ( seed=0, min=0, max=19 ) {
	let ms = Date.now() ;
	let bulb =  (ms >>> 4) + 1 + seed ;
	let blossom = bulb ;

	for ( var i = 0 ; i < 64 * ( bulb % 4 === 0 ? 1 : 2 ) ; i++ ) {
		blossom ^= blossom << 7 ;
		blossom ^= blossom >> 9 ;
		blossom ^= blossom << 8 ;
	}

	let spread = max - min + 1 ;
	let bloom = blossom % spread ;

	bloom = ( bloom < 0 ? ~bloom + 1 : bloom ) ;
	bloom = ( bloom === -0 ? 0 : bloom ) ;

	return bloom ;
};

// STRING BUILDER FROM 2D ARRAY
function buildStateStr ( grid ) {
	let str = '' ;

	for ( var y in grid ) {
		for ( var x in grid[y] ) {
			if ( grid[y][x] === 1)
				{ str += '0' ;}
			else
				{ str += '&nbsp;' ;}
		}
		str += '\n\r'
	}

	return str ;
};

function ripples () {
	let xLen = 300 ;
	let yLen = 250 ;
	let surface = new Surface ( xLen , yLen ) ;
	let drop = new Drop ( new Tetron (99,99) , xLen , yLen ) ;
	surface.addDrop ( drop ) ;
	let state = buildStateStr ( surface.grid ) ;
	let count = 0 ;

	function interval () {
		if ( count % 40 === 0 ) {
			let x_random = Math.floor( Math.random() * surface.xDim ) ;
			let y_random = Math.floor( Math.random() * surface.yDim ) ;
			let newDrop = new Drop ( new Tetron ( x_random , y_random ) , xLen , yLen ) ;
			surface.addDrop ( newDrop ) ;
		}
		surface.nextState() ;
		state = buildStateStr ( surface.grid ) ;
		document.getElementById ( 'sRipples' ).innerHTML = state ;
		count++ ;
		return ;
	};

	setInterval ( interval, 25 ) ;

	return ;
};

ripples () ;

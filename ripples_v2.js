class Tetron {
	x ;
	y ;
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
	bounds ;
	center ;
	phase = -1 ;
	maxPhase ;

	// @param {Tetron} {int} {int}
	constructor ( center , surfaceX , surfaceY ) {
		this.bounds = new Tetron ( surfaceX , surfaceY ) ;
		this.center = center ;
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

	ripple () {
		let r = this.radius ;
		let cX = this.center.x ;
		let cY = this.center.y ;
		// radius from 0 to 45 degrees
		let aLenAtRadius45 = Math.ceil( r * Math.sqrt( 0.5 ) ) ;
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
}
// END CLASS Drop

class Surface {
	xDim ;
	yDim ;
	grid = this.zState() ;
	drops = [] ; // {Drop[]}

	constructor ( xDim , yDim ) {
		this.xDim = xDim ;
		this.yDim = yDim ;
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

class Ripples {
	setZoom = '100%'

	fontSize = 9
	lineHeight = 6
	// ratio of Courier New = 0.6
	fontRatioWH = 0.6
	ratioLineHFont = this.lineHeight / this.fontSize
	//	parseInt( window.getComputedStyle( document.getElementById( 'sRipples' ) ).getPropertyValue( 'font-size' ) )

	winWidth = window.innerWidth
	winHeight = window.innerHeight
	xCharLen = Math.floor( ( this.winWidth * 3 / 4 ) / ( this.fontSize * this.fontRatioWH ) ) * ( 100 / parseInt(this.setZoom) ) - 2
	yCharLen = Math.floor( ( this.winHeight * 3 / 4 ) / ( this.fontSize * this.ratioLineHFont ) ) * ( 100 / parseInt(this.setZoom) ) - 2

	surface = new Surface ( this.xCharLen , this.yCharLen )
	state = buildStateStr ( this.surface.grid )
	intervalPeriod = 25
	// random time value in the range { 0.1 sec , 1.5 secs } converted to number of stepFrame intervals
	countToNextDrop = this.randomCount ()

	begin () {
		let self = this ;
		document.body.style.zoom = self.setZoom ;
		let x_random = Math.floor( Math.random() * self.surface.xDim ) ;
		let y_random = Math.floor( Math.random() * self.surface.yDim ) ;
		let newDrop = new Drop ( new Tetron ( x_random , y_random ) , self.xCharLen , self.yCharLen ) ;
		self.surface.addDrop ( newDrop ) ;
		self.state = buildStateStr ( self.surface.grid ) ;
		document.getElementById ( 'sRipples' ).innerHTML = self.state ;
		return ;
	}

	randomCount () {
		let self = this ;
		let randomTriad = Math.floor( Math.random() * 3 ) ;
		let countMax = 25 ;
		if ( randomTriad === 0 )
			{ countMax = 15 ; }
		if ( randomTriad === 1 )
			{ countMax = 20 ; }
		return Math.floor( ( Math.ceil( Math.random() * countMax ) / 10 ) * Math.floor( 1000 / self.intervalPeriod ) ) ;
	}

	 stepFrame () {
		let self = this ;
		if ( self.countToNextDrop === 0 ) {
			let x_random = Math.floor( Math.random() * self.surface.xDim ) ;
			let y_random = Math.floor( Math.random() * self.surface.yDim ) ;
			let newDrop = new Drop ( new Tetron ( x_random , y_random ) , self.xCharLen , self.yCharLen ) ;
			self.surface.addDrop ( newDrop ) ;

			if ( Math.floor( Math.random() * 4 ) === 0 )
				{ self.countToNextDrop = Math.ceil( Math.random() * Math.round( 2.5 * 100 / self.intervalPeriod ) ) ; }
			else
				{ self.countToNextDrop = self.randomCount () ; }
		}

		self.surface.nextState() ;
		self.state = buildStateStr ( self.surface.grid ) ;
		document.getElementById ( 'sRipples' ).innerHTML = self.state ;

		self.countToNextDrop-- ;
		return ;
	}
}
// END CLASS Ripples

function refresh () {
	clearInterval ( ripplesIntervalID ) ;
	ripples = new Ripples () ;
	ripples.begin ()
	ripplesIntervalID = window.setInterval ( () => ripples.stepFrame() , ripples.intervalPeriod ) ;
	isRunning = true ;
	return ;
};

function startStop () {
	if ( isRunning ) {
		clearInterval ( ripplesIntervalID ) ;
	} else {
		ripplesIntervalID = window.setInterval ( () =>  ripples.stepFrame() , ripples.intervalPeriod ) ;
	}
	isRunning = !isRunning ;
	return ;
};

function startStopEvent ( el ) {
	if ( el.target.hasPointerCapture (el.pointerId) ) {
      el.target.releasePointerCapture (el.pointerId) ;
	}
	startStop () ;
	return ;
};

let ripples = new Ripples () ;
ripples.begin ()
let ripplesIntervalID = window.setInterval ( () => ripples.stepFrame() , ripples.intervalPeriod ) ;
let isRunning = true ;
window.addEventListener( 'resize' , refresh ) ;
window.addEventListener( 'pointerdown' , startStopEvent ) ;

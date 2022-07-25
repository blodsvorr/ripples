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
	ringWidths = [ 8 , 7 ] ;

	// @param {Tetron} {int} {int}
	constructor ( center , surfaceX , surfaceY ) {
		this.bounds = new Tetron ( surfaceX , surfaceY ) ;
		this.center = center ;
		this.maxPhase = Math.floor ( 0.75 * this.calcMaxPhase ( surfaceX , surfaceY ) ) ;
	}

	get center () { return this._center }
	set center (c) { this._center = c }
	get phase () { return this._phase }
	set phase (ph) { this._phase = ph }
	get maxPhase () { return this._maxPhase }
	set maxPhase (m) { this._maxPhase = m }
	get ringWidths () { return this.ringWidths }
	set ringWidths (r) { this.ringWidths = r }

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

	ripple ( ) {
		let r = this.radius ;
		let outerRingWidth = this.ringWidths[0] ;
		let innerRingWidth = this.ringWidths[1] ;
		let r1 = r - outerRingWidth ;
		let r2 = r1 - innerRingWidth ;
		let cX = this.center.x ;
		let cY = this.center.y ;
		// radius from 0 to 45 degrees
		let aLenAtRadius45 = Math.floor( r * Math.sqrt( 0.5 ) ) ;
		// array of Tetron array
		let ripples = [] ;
		let thisPhase = this.phase ;
		let maxPhase = this.maxPhase ;

		function calc_b ( radius , a ) {
			return Math.floor( Math.sqrt( radius*radius - a*a ) ) ;
		};

		function circle8 ( radius ) {
			let tetrons = [] ;
			for ( var a = 0 ; a <= aLenAtRadius45 ; a++ ) {
				var b = calc_b ( radius , a ) ;
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

		if ( r > 0 )
			{ ripples.push( circle8(r) ) ; }

		if ( r1 > 0 )
			{ ripples.push( circle8(r1) ) ; }

		if ( r2 > 0 )
			{ ripples.push( circle8(r2) ) ; }

		if ( thisPhase > maxPhase - 30 ) {
			if ( thisPhase < maxPhase - 22 ) {
				ripples[1] = [ ...ripples[1] , ...ripples[0] ];
				ripples[0] = [] ;
			} else if ( thisPhase < maxPhase - 15 ) {
				ripples[2] = [ ...ripples[2] , ...ripples[0] ] ;
				ripples[0] = [] ;
			} else if ( thisPhase < maxPhase - 7 ) {
				ripples[2] = [ ...ripples[2] , ...ripples[1] ] ;
				ripples[1] = [] ;
				ripples[0] = [] ;
			} else {
				ripples[1] = [] ;
				ripples[0] = [] ;
			}
		}

		return ripples ;
	};

	calcMaxPhase ( s_xDim , s_yDim ) {
		let maxPhase ;
		let candidate ;
		let xPos = s_xDim - this.center.x ;
		let xNeg = this.center.x ;
		let yPos = s_yDim - this.center.y ;
		let yNeg = this.center.y ;
		let ringWidthAddend = this.ringWidths[0] + this.ringWidths[1] ;

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

		return maxPhase + ringWidthAddend ;
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
		let self = this ;
		self.grid = self.zState() ;
		// Reverse for loop to allow changing array (drops) length
		for ( var i = self.drops.length - 1 ; i >= 0 ; i-- ) {
			var dropRipple = self.drops[i].grow() ;
			if ( dropRipple != null )
				{ self.render ( dropRipple ) ; }
			if ( dropRipple === null )
				{ self.removeDrop(i) ; }
		 }
		return ;
	};

	addDrop ( drop ) {
		let self = this ;
		self.drops.push( drop ) ;
		return ;
	};

	removeDrop ( index ) {
		let self = this ;
		self.drops.splice( index , 1 ) ;
		return ;
	};

	render ( rippleCircles ) {
		let self = this ;
		let indexSymbolKeys = [ 1 , 2 , 3 ] ;
		for ( var j = rippleCircles.length - 1 ; j >= 0 ; j-- ) {
			var rippleTetrons = rippleCircles[j] ;
			var k = indexSymbolKeys[j] ;

			for ( var i = 0 ; i < rippleTetrons.length ; i++ ) {
				var c = rippleTetrons[i].x ;
				var r = rippleTetrons[i].y ;
				if ( c >= 0 && c < self.xDim && r >= 0 && r < self.yDim ) {
					self.grid[r][c] = ( ( self.grid[r][c] === 0 || self.grid[r][c] > k ) ? k : self.grid[r][c] ) ;
				}
			}
		}
		return ;
	};
}
// END CLASS Surface

function buildState ( grid ) {
	let canvas = document.getElementById ( 'rippleCanvas' ) ;
	let ctx = canvas.getContext ( '2d' ) ;
	let shades = [ '#180a44' , 'rgba( 33,144,255,1 )' , 'rgba( 33,144,255,0.67 )' , 'rgba( 33,144,255,0.33 )' ] ;

	let dpi = window.devicePixelRatio ;
	let style_height = +getComputedStyle( canvas ).getPropertyValue( 'height' ).slice(0,-2) ;
	let style_width = +getComputedStyle( canvas ).getPropertyValue( 'width' ).slice(0,-2) ;
	let sHeight = style_height * dpi ;
	let sWidth = style_width * dpi ;

	canvas.setAttribute( 'height' , sHeight ) ;
	canvas.setAttribute( 'width' , sWidth ) ;

	ctx.clearRect ( 0 , 0 , sWidth , sHeight ) ;
	for ( var y in grid ) {
		for ( var x in grid[y] ) {
			let val = grid[y][x] ;
			if ( val > 0 ) {
				var xPixel = x*pixel*dpi ;
				var yPixel = y*pixel*dpi ;
				ctx.fillStyle = shades[val] ;
				ctx.fillRect ( xPixel , yPixel , pixel*dpi , pixel*dpi ) ;
			}
		}
	}
	return  ;
};

class Ripples {
	setZoom = '100%'

	width = Math.floor( window.innerWidth / pixel - 16 / pixel )
	height = Math.floor( window.innerHeight / pixel - 16 / pixel )
	surface = new Surface ( this.width , this.height )
	intervalPeriod = 33
	// random time value in the range { 0.1 sec , 1.5 secs } converted to number of stepFrame intervals
	countToNextDrop = this.randomCount ()

	begin () {
		let self = this ;
		document.body.style.zoom = self.setZoom ;
		let x_random = Math.floor( Math.random() * self.surface.xDim ) ;
		let y_random = Math.floor( Math.random() * self.surface.yDim ) ;
		let newDrop = new Drop ( new Tetron ( x_random , y_random ) , self.width , self.height ) ;
		self.surface.addDrop ( newDrop ) ;
		document.getElementById ( 'sRipples' ).style.width = ( self.width * pixel ) + 'px' ;
		document.getElementById ( 'sRipples' ).style.height = ( self.height * pixel ) + 'px' ;
		document.getElementById ( 'rippleCanvas' ).style.width = ( self.width * pixel ) + 'px' ;
		document.getElementById ( 'rippleCanvas' ).style.height = ( self.height * pixel ) + 'px' ;
		self.surface.nextState() ;
		buildState ( self.surface.grid ) ;
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
			let newDrop = new Drop ( new Tetron ( x_random , y_random ) , self.width , self.height ) ;
			self.surface.addDrop ( newDrop ) ;

			if ( Math.floor( Math.random() * 4 ) === 0 )
				{ self.countToNextDrop = Math.ceil( Math.random() * Math.round( 2.5 * 100 / self.intervalPeriod ) ) ; }
			else
				{ self.countToNextDrop = self.randomCount () ; }
		}

		self.surface.nextState() ;
		buildState ( self.surface.grid ) ;

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

let pixel = 8 ;
let ripples = new Ripples () ;
ripples.begin ()
let ripplesIntervalID = window.setInterval ( () => ripples.stepFrame() , ripples.intervalPeriod ) ;
let isRunning = true ;
window.addEventListener( 'resize' , refresh ) ;
window.addEventListener( 'pointerdown' , startStopEvent ) ;

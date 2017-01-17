'use strict';


var reveal1SpriteMap = [
					[0, 0, 800, 450],
					[0, 451, 800, 450],
					[801, 0, 800, 450],
					[801, 451, 800, 450],
					[0, 902, 800, 450],
					[0, 1353, 800, 450],
					[801, 902, 800, 450],
					[801, 1353, 800, 450],
					[1602, 0, 800, 450],
					[1602, 451, 800, 450],
					[2403, 0, 800, 450],
					[1602, 902, 800, 450],
					[2403, 451, 800, 450],
					[1602, 1353, 800, 450],
					[2403, 902, 800, 450],
					[2403, 1353, 800, 450],
					[0, 1804, 800, 450],
					[0, 2255, 800, 450],
					[801, 1804, 800, 450],
					[0, 2706, 800, 450],
					[801, 2255, 800, 450],
					[0, 3157, 800, 450],
					[1602, 1804, 800, 450],
					[801, 2706, 800, 450],
					[1602, 2255, 800, 450],
					[801, 3157, 800, 450],
					[2403, 1804, 800, 450],
					[1602, 2706, 800, 450],
					[2403, 2255, 800, 450]
					];

var globalSpriteList = [];
var globalCanvasList = [];
var globalRevealSprites = [];

function Math_sign(num)
{
	if (num < 0)
		return -1;
	else if (num > 0)
		return 1;
	else
		return 0; 
}

//=====================================================================
//					Spritesheet
//=====================================================================

function SpriteSheet(imageEl, durationMilisecs, delayMilisecs, frameMap, frameCoords)
{
	this.image = imageEl;
	if (this.image && this.image.naturalHeight > 0)
	{
		var img = new Image();
		img.src = this.image.src;
		this.image = img;
	}
	this.map = frameMap;
	this.duration = Number(durationMilisecs);
	this.duration_div = 1.0 / durationMilisecs;
	this.delay = Number(delayMilisecs || 0);
	this.time = 0;
	this.frame = -1;
	this.frameCoords = frameCoords || null;
	this.frameCount = frameMap.length;
	this.frameDur = durationMilisecs / frameMap.length;
	this.frameWasDrawn = false;
	this.canvas = null;
	this.loop = false;

	this.isControl = false;
	this.mouseEnterFrames = [];
	this.mouseLeaveFrames = [];
	this.clickFrames = [];
	this.unclickFrames = [];
	this.clickClass = '';
}

SpriteSheet.prototype.calcFrameMap = function()
{
	if (this.image && this.image.naturalHeight > 0)
	{
		var img = new Image();
		img.src = this.image.src;
		this.image = img;
	}
	var frameCount = this.image.naturalWidth / this.frameCoords[0];
	this.frameCount = Math.floor(frameCount);
	this.map = [];
	for (var i = 0; i < frameCount; i++)
	{
		this.map.push([ i*this.frameCoords[0], 0, this.frameCoords[0], this.frameCoords[1] ]);
	}
	this.frameDur = this.duration / this.map.length;
}


SpriteSheet.prototype.draw = function(ctx, x0, y0, width, height)
{
	var f = Math.min(this.frame, this.map.length-1);
	f = Math.max(f, 0);
	this.frame = f;
	if ( this.map.length==0 )
	{
		if ( this.image.complete )
		{
			this.calcFrameMap();
		}
		else
			return;
	}
	if (f < this.map.length)
	{
		var c = this.map[f];
		ctx.drawImage(this.image, c[0], c[1], c[2], c[3], x0, y0, width, height);
		this.frameWasDrawn = true;
	}
}

// returns wether is has exceeded its duration
SpriteSheet.prototype.setTime = function(milisecs, loop)
{
	this.time = milisecs;

	if (this.loop)
	{
		if (milisecs > this.delay)
		{
			this.time = this.delay + ((milisecs - this.delay) % this.duration);
		}
	}
	if (Number(this.time) > (Number(this.delay) + Number(this.duration)))
	{
		this.frameWasDrawn = true;
		this.frame = this.frameCount - 1;
		return false;
	}

	var time = Math.max(0, this.time - this.delay) * this.duration_div;
	var frame = Math.floor(time * this.frameCount);
	if (frame != this.frame)
	{
		this.frameWasDrawn = false;
	}
	this.frame = frame;

	return true;
}

SpriteSheet.prototype.addTime = function(milisecs, loop)
{
	// var time = this.delay + this.frame * this.frameDur;
	// time += milisecs;
	// if (loop)
	// {
	// 	time = this.delay + ((time - this.delay) % this.duration);
	// 	this.frameWasDrawn = false;
	// }
	// else if ( time <= this.duration )
	// {
	// 	this.frameWasDrawn = false;
	// }
	return this.setTime(this.time + milisecs, loop);
}

SpriteSheet.prototype.getShouldDrawFrame = function()
{
	return !this.frameWasDrawn;
}


//=====================================================================
//					DrawSurface
//=====================================================================


function Canvas(canvasEl, imgEl, sprite, revealMaskIndex, maskDelay, extraScale)
{
	this.canvas = canvasEl || null;
	this.ctx = (canvasEl ? canvasEl.getContext('2d') : null);
	// if (isEdge && this.ctx)	{ this.ctx.msImageSmoothingEnabled = true; console.log('msImageSmoothingEnabled '+this.ctx.msImageSmoothingEnabled); }
	this.ctx.imageSmoothingEnabled = true;
	this.sprite = sprite || null;
	this.img = imgEl || null;

	if (this.sprite)
	{
		this.sprite.canvas = this;
	}
	this.shouldDrawSprite = true;

	// if (this.img)
	// {
	// 	if (this.img.naturalHeight > 0)
	// 	{
	// 		var img = new Image();
	// 		img.src = this.img.src;
	// 		this.img = img;
	// 	}
	// }

	// this.mask = revealMask || null;
	this.mask = null;
	this.maskIdx = revealMaskIndex || null;
	// masks are shared, so we must keep properties for time and delay
	this.maskTime = 0;
	this.maskDelay = maskDelay || 0;
	this.animateMask = true;

	this.time = 0;
	this.frame = 0;
	this.frameDrawn = false;
	this.startTime = null;
	this.shoudlDrawMask = false;
	this.hash = -1;
	this.completeCallback = null;

	this.extraScale = Number(extraScale || 1);

	this.recalcSize();
}


Canvas.prototype.free = function()
{
	this.canvas.width = 0;
	this.canvas.height = 0;
	// imgAssetFree(this.imgAssetIndex);
};

Canvas.prototype.clear = function()
{
	this.ctx.clearRect(this.img, 0, 0, this.canvas.width, this.canvas.height);
}

Canvas.prototype.invalidate = function()
{

	// if (this.img)
	// {
	// 	if (this.img.naturalHeight > 0)
	// 	{
	// 		var img = new Image();
	// 		img.src = this.img.src;
	// 		this.img = img;
	// 	}
	// }
	this.recalcSize();
	this.resetMask();
	this.draw();
}

Canvas.prototype.recalcSize = function()
{
	this.frameDrawn = false;

	var backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
								this.ctx.mozBackingStorePixelRatio ||
								this.ctx.msBackingStorePixelRatio ||
								this.ctx.oBackingStorePixelRatio ||
								this.ctx.backingStorePixelRatio || 1;

	// var oldWidth = this.img.width;
	// var oldHeight = this.img.height;

	var oldWidth = 0;
	var oldHeight = 0;

	// this.canvas.style.width = 'inherit';
	// this.canvas.style.height = 'inherit';
	this.canvas.style.width = '100%';
	this.canvas.style.height = '100%';
	var $parent = $(this.canvas).parent();//.parent();
	// var xform = $parent.css('transform') || ',,0';
	// xform = xform.split(',');
	// xform = xform[xform.length-2] || 0;
	// var depth = parseFloat(xform) || 0;

	// var ratio = Math.abs(depth) / 1000;
	// ratio += 1.1;

	// // ratio = Math.pow(ratio, 10);

	// // if (!isWebkit)
	// 	ratio = 1;

	// console.log('ratio['+ratio+'] depth: '+depth);

	// if (this.sprite && this.sprite.frame.length > 1)
	// {
	// 	oldWidth = this.sprite.frame[0];
	// 	oldHeight = this.sprite.frame[1];
	// }
	// else
	// if (this.img !== null)
	// {
	// 	// oldWidth = this.img.naturalWidth;
	// 	// oldHeight = this.img.naturalHeight;
	// 	oldWidth = this.img.width;
	// 	oldHeight = this.img.height;
	// }


	oldWidth = Math.floor( $parent.width() );
	oldHeight = Math.floor( $parent.height() );

	// console.log('width old['+oldWidth+'] new['+(oldWidth * canvasPixelRatio)+']');
	// console.log('height old['+oldHeight+'] new['+(oldHeight * canvasPixelRatio)+']');
	



	// backingStoreRatio /= 5;
	// var scale = Number($(this.canvas).parent().attr('data-scale') || 1);
	// scale = scale > 3 ? 3 : 1;
	
	// backingStoreRatio /= this.extraScale;
	var ratio = 1;
	// if (this.img && this.extraScale > 1)
	// {
	// 	var ratio = this.img.height / (this.img.naturalHeight || 1); // prevent infinity
	// 	ratio = (ratio !== ratio ? 1 : ratio); // check for NaN;
	// 	// ratio = (ratio > 1 ? )

	// 	ratio /= this.extraScale;
	// 	// ratio = Math.pow(2, 10 * (ratio - 1)) * 0.3;
	// 	// ratio *= ratio * ratio;
	// }
	// backingStoreRatio *= ratio;

	var canvasPixelRatio = 1;//_devicePixelRatio / backingStoreRatio;

	if (canvasPixelRatio < 1)
	{
		// console.log('canvasPixelRatio: '+canvasPixelRatio);
	}

	// if (isEdge)
	// {
	// 	canvasPixelRatio *= 2;
	// 	// canvasPixelRatio = _devicePixelRatio / backingStoreRatio;
	// 	// console.log('canvasPixelRatio '+canvasPixelRatio);
	// }




	// if ( this.img && this.img.complete && this.img.naturalHeight && oldHeight * canvasPixelRatio > this.img.naturalHeight )
	// {
	// 	var smaller = this.img.naturalHeight / (oldHeight * canvasPixelRatio) ;
	// 	canvasPixelRatio *= 1/smaller;
	// 	canvasPixelRatio = Math.max(canvasPixelRatio, 1);
	// }

	{
		var cw = Math.ceil(oldWidth * canvasPixelRatio  );
		var ch = Math.ceil(oldHeight * canvasPixelRatio  );
		cw = (cw !== cw ? 0 : cw);
		ch = (ch !== ch ? 0 : ch);
		// if (/*!isNonDesktop &&*/ this.img && this.img.naturalHeight > 0)
		// {
		// 	if (ch < this.img.naturalHeight)
		// 	{
		// 		if (!this.sprite)
		// 		{
		// 			cw = this.img.naturalWidth;
		// 			ch = this.img.naturalHeight;
		// 			canvasPixelRatio = cw / oldWidth;					
		// 		}
		// 		else
		// 		{
		// 			ch = this.img.naturalHeight;
		// 			canvasPixelRatio = ch / oldHeight;
		// 			cw *= canvasPixelRatio;
		// 			cw = Math.ceil(cw);
		// 		}
		// 	}
		// 	var extra = (isNonDesktop ? 0.5 : 1)*this.extraScale;
		// 	if (extra > canvasPixelRatio)
		// 	{
		// 		canvasPixelRatio = extra;
		// 		// if (isEdge) canvasPixelRatio *= 0.02;
		// 		cw = Math.ceil(oldWidth * canvasPixelRatio  );
		// 		ch = Math.ceil(oldHeight * canvasPixelRatio  );
		// 		// if (isEdge)	console.log('canvasPixelRatio '+canvasPixelRatio);
		// 	}
		// }
		this.canvas.width = cw;//Math.min(cw, 500);
		this.canvas.height = ch;//Math.min(ch, 500);
		
	}
	// this.canvas.width = Math.round(oldWidth * canvasPixelRatio * this.extraScale );
	// this.canvas.height = Math.round(oldHeight * canvasPixelRatio * this.extraScale );

	// this.canvas.style.width = oldWidth / 16 + 'rem';
	// this.canvas.style.height = oldHeight / 16 + 'rem';

	// now scale the context to counter
	// the fact that we've manually scaled
	// our canvas element
	this.ctx.scale(canvasPixelRatio , canvasPixelRatio  );
	// this.ctx.scale(canvasPixelRatio *this.extraScale , canvasPixelRatio *this.extraScale );
};


Canvas.prototype.setTime = function(timestamp)
{
	// console.log('setTime('+this.hash+'): '+timestamp);
	if (this.startTime === null)
		this.startTime = timestamp;

	// if (this.frameDrawn)
	// {
	// 	this.startTime = timestamp;
	// 	return;
	// }

	var timeDiff = timestamp - this.startTime;
	this.startTime = timestamp;

	if ( this.sprite !== null )
	{
		this.shouldDrawSprite = this.sprite.addTime(timeDiff, true);
		this.frameDrawn = false;
	}

	if ( this.mask !== null )
	{
		if ( this.animateMask )
		{
			this.maskTime += timeDiff;
		}
		this.shoudlDrawMask = this.mask.setTime(this.maskTime);
		this.mask.delay = this.maskDelay;
		this.frameDrawn = false;
	}
}


Canvas.prototype.resetMask = function()
{
	// console.log('resetMask '+this.hash);
	this.maskTime = 0;
	this.shoudlDrawMask = true;
	this.frameDrawn = false;
	this.animateMask = true;
}

Canvas.prototype.draw = function()
{
	// if (this.frameDrawn)
	// {
	// 	return;
	// }

	// timeDiff -= maskLag;
	// if (timeDiff < 0)
	// {
	// 	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	// 	return;
	// }


	// if (maskFrame >= mask.frameCount)
	// if ( !drawMask )
	// {
	// 	stopAnimMask();
	// 	if ( imgSprite === null )
	// 		return;
	// }

	if (!this.mask)
	{
		this.mask = globalRevealSprites[this.maskIdx] || null;
	}

	this.ctx.globalCompositeOperation = 'copy';

	// mask.frame = maskFrame;
	// maskFrame++;

	// ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	
	// if (this.shoudlDrawMask)
	if ( this.mask !== null )
	{
		var drawNext = this.mask.setTime(this.maskTime);
		// console.log('draw('+this.hash+') mask frame '+this.mask.frame);

		this.mask.draw(this.ctx, 0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

		this.ctx.globalCompositeOperation = 'source-in';

		if (!drawNext)
		{
			this.completeCallback && this.completeCallback();
		}
	}

	if ( this.sprite !== null )
	{
		this.sprite.draw(this.ctx, 0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
		if (!this.shouldDrawSprite)
		{
			this.completeCallback && this.completeCallback();
		}
	}
	else
		if ( this.img !== null )
		{
			this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
			// this.ctx.drawImage(this.img, 0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
			// this.ctx.drawImage(this.img, 
			// 							// 0, 0, this.img.width, this.img.height, 
			// 							0, 0, this.img.naturalWidth, this.img.naturalHeight, 
			// 							0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
		}

	this.frameDrawn = true;

	// if (this.mask && this.mask.shoudlDrawMask==false && this.completeCallback)
	// 	this.completeCallback();
};


//=============================================================

function setupRevealMasks()
{
	var revealMaskFiles = [
		['Content/Media/reveal-atlas.png', reveal1SpriteMap],
		// ['./img/reveal-atlas.png', reveal1SpriteMap],
	];


	function loadRevealMaskHandler(e)
	{
		var parts = e.target.src.split('/');
		var fname = parts[parts.length - 1];
		for (var i = 0; i < revealMaskFiles.length; i++)
		{
			if (revealMaskFiles[i][0].indexOf(fname) > -1)
			{
				globalRevealSprites.push( new SpriteSheet(this, 1500, 0, reveal1SpriteMap) );
				// loadHandler(e);
				return;
			}
		}
	}

	for (var i = 0; i < revealMaskFiles.length; i++)
	{
		var img = new Image();
		img.onload = loadRevealMaskHandler;
		img.src = revealMaskFiles[i][0];
	}

	//=========================

	$('.reveal-mask').each(function(index, elem) 
	{
		var $reveal = $(elem);
		var $img = $reveal.find('img').first();

		
		// var hash = $parent.attr('data-hash') || 0;
		var mask = null;
		var maskIdx = $reveal.attr('data-mask') || null;
		if (maskIdx==null)
			return;

		mask = (maskIdx !== null ? globalRevealSprites[maskIdx] : null );

		var canvasEl = document.createElement('canvas');
		$reveal.append(canvasEl);

		function loadImgHandler(e)
		{
			// console.log(e);
			canvasEl.width = e.target.width;
			canvasEl.height = e.target.height;
		}

		if ( !$img[0].complete || $img[0].naturalWidth==0 || $img[0].naturalHeight==0)
			$img.on('load', loadImgHandler);

		var canvas = new Canvas(canvasEl, $img[0], null, maskIdx, 
								$reveal.attr('data-lag') || 0, $reveal.attr('data-scale') || 1);

		function setCanvasSize()
		{
			canvasEl.width = $img.width();
			canvasEl.height = $img.height();

			if (canvasEl.width == 0 || canvasEl.height == 0)
				setTimeout(setCanvasSize, 100);
		}

		setCanvasSize();

		// console.log('setting canvas size to ['+canvasEl.width+', '+canvasEl.height+']');
		// console.log('using img size ['+$img[0].naturalWidth+', '+$img[0].naturalHeight+']');

		$reveal.attr('data-canvas', globalCanvasList.length);

		globalCanvasList.push(canvas);
	});

}


function setupSprites()
{
	var spriteAtlasMaps = [
		[
			[1, 1, 220, 220],
			[1, 223, 220, 220],
			[1, 445, 220, 220],
			[1, 667, 220, 220],
			[223, 1, 220, 220],
			[223, 223, 220, 220],
			[223, 445, 220, 220],
			[223, 667, 220, 220],
			[445, 1, 220, 220],
			[445, 223, 220, 220],
			[445, 445, 220, 220],
			[445, 667, 220, 220],
			[667, 1, 220, 220],
			[667, 223, 220, 220],
			[667, 445, 220, 220],
			[667, 667, 220, 220],
			[889, 1, 220, 220],
			[889, 223, 220, 220],
			[889, 445, 220, 220],
			[889, 667, 220, 220],
			[1111, 1, 220, 220]
		]
	];

	$('.sprite').each(function(index, elem)
	{
		var $this = $(elem);
		var mapIdx = $this.attr('data-frame-map') || null;
		if (mapIdx === null)
			return;

		mapIdx = Number(mapIdx);
		
		var duration = $this.attr('data-duration') || 1;
		duration = Number(duration)*1000;
		var lag = $this.attr('data-lag') || 0;
		lag = Number(lag)*1000;

		var $img = $this.find('img').first();

		
		var canvasEl = document.createElement('canvas');
		$this.append(canvasEl);

		function loadImgHandler(e)
		{
			// console.log(e);
			canvasEl.width = e.target.width;
			canvasEl.height = e.target.height;
		}

		if ( !$img[0].complete || $img[0].naturalWidth==0 || $img[0].naturalHeight==0)
			$img.on('load', loadImgHandler);

		var sprite = new SpriteSheet($img[0], duration, lag, spriteAtlasMaps[mapIdx]);
		var canvas = new Canvas(canvasEl, null, 
								sprite,
								null, 
								lag, 1);

		var dim = $this.attr('data-dimensions') || null;

		function setCanvasSize()
		{
			canvasEl.width = $img.parent().width();
			canvasEl.height = $img.parent().height();

			if (canvasEl.width == 0 || canvasEl.height == 0)
				setTimeout(setCanvasSize, 100);
		}

		// if (dim)
		// {
		// 	var parts = dim.split(' ');
		// 	canvasEl.width = Number(parts[0]);
		// 	canvasEl.height = Number(parts[1]);
		// }
		// else
		{
			setCanvasSize();
		}

		// console.log('setting canvas size to ['+canvasEl.width+', '+canvasEl.height+']');
		// console.log('using img size ['+$img[0].naturalWidth+', '+$img[0].naturalHeight+']');

		$this.attr('data-canvas', globalCanvasList.length);

		globalCanvasList.push(canvas);

	});
}

//=====================================================================





//==================================================================================

function shuffle(array) 
{
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}


var TileGame = 
{
	init: function()
	{
		this.img = document.querySelector('#tile-game img.one-big-pic');
		this.tempCanvas = {width: 0, height: 0};
		if (!this.img)
		{
			// this.tempCanvas = null;
			// console.log('"#tile-game img.one-big-pic" was not found');
			// return;
		}
		else
		{
			// this.tempCanvas = document.createElement("canvas");
		}
		this.recalcTilePositions = true;
		this.tileOrder = shuffle([0, 1, 2, 3, 4, 5]);
		this.checkComplete();
		this.tilePositions = [[], [], [], [], [], []];
		this.hasOneBigPic = $('#tile-game img.one-big-pic').length > 0;
		if (this.hasOneBigPic)
		{
			$('#tile-game .tile').css('background-image', 'url("'+this.img.src+'")');
		}
		else
		{
			$('#tile-game > img').each(function(index, elem)
			{
				var $tile = $('#tile-game .tile'+(index+1));
				$tile.css('background-image', 'url("'+elem.src+'")');
				$tile.css('background-size', 'cover');
				$tile.css('background-position', '50% 50%');
			});
		}
		// document.querySelector('#tile-game').appendChild(this.tempCanvas);
	},

	checkComplete: function()
	{
		var complete_count = 0;
		for (var i = 0; i < this.tileOrder.length; i++)
		{
			if (i == this.tileOrder[i])
			{
				var $tile = $('#tile-game .tile'+(i+1) );
				if ($tile.hasClass('complete')==false)
				{
					goNext();
					$tile.addClass('complete');
				}
				complete_count++;
			}
		}
		if (complete_count == this.tileOrder.length)
		{
			$('#tile-game .tile-wrapper' ).addClass('complete');
			setTimeout(function()
			{
				$('.intro-game .skip').trigger('click');
			}, 1000);
		}
	},

	resize: function()
	{
		this.tempCanvas.width = $(window).width()+3;
		this.tempCanvas.height = $(window).height()+2;
		// this.tempCtx = this.tempCanvas.getContext('2d');
		if (this.img)
		{
			if (this.img.naturalHeight == 0 || !this.img.complete )
			{
				var $img = $(this.img);
				var self = this;
				$img.on('load', function(e)
				{
					self.splitImageToTiles();
				});
			}
			else
			{
				this.splitImageToTiles();
			}
		}
		else
		{
			this.setSeparateTiles();
		}
	},

	setSeparateTiles: function()
	{
		var canvasWidth = $(window).width();
		var canvasHeight = $(window).height();

		var tileWidth = 0;
		var tileHeight = 0;
		if (canvasWidth >= canvasHeight)
		{
			tileWidth = Math.floor(canvasWidth / 3);
			tileHeight = Math.floor(canvasHeight / 2);
		}
		else
		{
			tileWidth = Math.floor(canvasWidth / 2);
			tileHeight = Math.floor(canvasHeight / 3);			
		}

		var $tile = $('#tile-game .tile');
		$tile.width(tileWidth);
		$tile.height(tileHeight);

		var tilePosX = 0;
		var tilePosY = 0;
		var tileXStep = 0;
		var tileYStep = 0;

		for (var k = 0; k < 6; k++)
		{
			var $tile = $( '#tile-game .tile' + ( this.tileOrder[k]+1) );
			$tile.css('left', (tilePosX)+'px')
				.css('top', (tilePosY)+'px' );

			this.tilePositions[ this.tileOrder[k] ] = [tilePosX, tilePosY];

			if (tilePosX + tileWidth+5 > canvasWidth)
			{
				tilePosX = 0;
				tileXStep = 0;
				tilePosY += tileHeight;
				tileYStep++;
			}
			else
			{
				tilePosX += tileWidth;
				tileXStep++;
			}

			if (tilePosY + tileHeight > canvasHeight)
				break; // for loop
		}
	},

	splitImageToTiles: function()
	{
		var iw = this.img.naturalWidth;
		var ih = this.img.naturalHeight;
		// if (this.img)
		// {
		// 	iw = this.img.naturalWidth;
		// 	ih = this.img.naturalHeight;
		// }
		var canvasWidth = this.tempCanvas.width;
		var canvasHeight = this.tempCanvas.height;

		var tileWidth = 0;
		var tileHeight = 0;
		if (canvasWidth >= canvasHeight)
		{
			tileWidth = Math.floor(canvasWidth / 3);
			tileHeight = Math.floor(canvasHeight / 2);
		}
		else
		{
			tileWidth = Math.floor(canvasWidth / 2);
			tileHeight = Math.floor(canvasHeight / 3);			
		}

		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;

		// Make sure the image 'covers' the window area.

		var w1 = canvasHeight * (iw / ih);
		var h1 = w1 * (ih / iw);

		var h2 = canvasWidth * (ih / iw);
		var w2 = h2 * (iw / ih);

		// console.log('['+w1+', '+h1+'] aspect '+(w1/h1));
		// console.log('['+w2+', '+h2+'] aspect '+(w2/h2));

		w1 = Math.round(w1);
		h1 = Math.round(h1);
		w2 = Math.round(w2);
		h2 = Math.round(h2);

		var drawWidth = 0;
		var drawHeight = 0;
		var drawXgap = 0;
		var drawYgap = 0;

		if (w1 >= w2 && h1 >= h2)
		{
			drawWidth = w1;
			drawHeight = h1;
		}
		else
		{
			drawWidth = w2;
			drawHeight = h2;
		}
		drawXgap = (drawWidth - canvasWidth) / 2;
		drawYgap = (drawHeight - canvasHeight) / 2;

		if (this.hasOneBigPic)
		{
			$('#tile-game .tile').css('background-size', drawWidth+'px '+drawHeight+'px');
		}


		// this.tempCtx.drawImage(this.img, 0, 0, iw, ih, -drawXgap, -drawYgap, drawWidth, drawHeight);
		// // this.tempCtx.drawImage(this.img, 0, 0, iw, ih, -drawXgap, -drawYgap, drawWidth-drawXgap, drawHeight-drawYgap);
		// // this.tempCtx.drawImage(this.img, 0, 0, iw, ih, 0, 0, canvasWidth, canvasHeight);

		var tilePosX = 0;
		var tilePosY = 0;
		var tileXStep = 0;
		var tileYStep = 0;

		// console.log(this.tileOrder);

		// this loop spatially arranges the tiles
		for (var k = 0; k < 6; k++)
		{
			// // var canvas = document.querySelector('#tile-game .tile'+(k+1)+' canvas');
			// var canvas = document.querySelector('#tile-game .tile'+(this.tileOrder[k]+1)+' canvas');
			// canvas.width = tileWidth;
			// canvas.height = tileHeight;
			// var $canvas = $(canvas);
			var $parent = $( document.querySelector('#tile-game .tile'+(this.tileOrder[k]+1)) );//.parent();
			$parent.width(tileWidth);
			$parent.height(tileHeight);
			$parent.css('top', tilePosY+'px');
			$parent.css('left', tilePosX+'px');

			// if (this.recalcTilePositions)
			// 	this.tilePositions.push([tilePosX, tilePosY]);
			// else
				// this.tilePositions[ k ] = [tilePosX, tilePosY];
				this.tilePositions[ this.tileOrder[k] ] = [tilePosX, tilePosY];


			// var ctx = canvas.getContext('2d');

			// ctx.drawImage(this.tempCanvas, 
			// 						tilePosX, tilePosY, tileWidth, tileHeight, 
			// 						0, 0, tileWidth, tileHeight);

			if (tilePosX + tileWidth+5 > canvasWidth)
			{
				tilePosX = 0;
				tileXStep = 0;
				tilePosY += tileHeight;
				tileYStep++;
			}
			else
			{
				tilePosX += tileWidth;
				tileXStep++;
			}

			if (tilePosY + tileHeight > canvasHeight)
				break; // for loop
		}

		tilePosX = 0;	tileXStep = 0;
		tilePosY = 0;	tileYStep = 0;
		// this loop mixes the drawn parts
		for (var k = 0; k < 6; k++)
		{
			// var canvas = document.querySelector('#tile-game .tile'+( k+1 )+' canvas');
			// var $canvas = $(canvas);

			// var ctx = canvas.getContext('2d');

			// ctx.drawImage(this.tempCanvas, 
			// 						tilePosX, tilePosY, tileWidth, tileHeight, 
			// 						0, 0, tileWidth, tileHeight);

			if (this.hasOneBigPic)
			{
				var $tile = $( '#tile-game .tile' + ( k+1) );
				$tile.css('background-position', (-((tileXStep*tileWidth)+drawXgap) )+'px '+ (-((tileYStep*tileHeight)+drawYgap) )+'px' );
				// $tile.css('background-position', (tilePosX)+'px '+(tilePosY)+'px' );
			}

			if (tilePosX + tileWidth+5 > canvasWidth)
			{
				tilePosX = 0;
				tileXStep = 0;
				tilePosY += tileHeight;
				tileYStep++;
			}
			else
			{
				tilePosX += tileWidth;
				tileXStep++;
			}

			if (tilePosY + tileHeight > canvasHeight)
				break; // for loop
		}

		this.recalcTilePositions = false;

	},

	getIndex: function($tile)
	{
		var c = $tile.attr('class') || '';
		c = c.replace('tile', '');
		c = c.replace('tile', '');
		c = c.replace('active', '');
		c = c.trim();

		// console.log('idx '+c);

		var idx = Number(c) || 1;
		idx--;

		return idx;
	},

	getPosition: function($tile)
	{
		return this.tilePositions[this.getIndex($tile)];
	},

	addEvents: function()
	{
		var self = this;
		var $tile = $('#tile-game .tile');
		var isDragging = false;
		var $boundTile = null;
		var tileOrigPos = [0, 0];
		var tileOffset = [0, 0];

		function handleMove(e)
		{
			if (!isDragging || !$boundTile)
			{
				$('#tile-game .tile-wrapper').off('mousemove touchmove', handleMove);
				return;
			}

			var hit = null;

			if (e.type.toLowerCase() === 'touchmove')
			{
				$boundTile.css('left', (e.originalEvent.touches[0].clientX + tileOffset[0])+'px');
				$boundTile.css('top', (e.originalEvent.touches[0].clientY + tileOffset[1])+'px');
				// console.log('['+(e.originalEvent.touches[0].clientX - tileOffset[0])+', '+(e.originalEvent.touches[0].clientY - tileOffset[1])+']');
				hit = document.elementFromPoint(e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY);				
			}
			else // mousemove
			{
				$boundTile.css('left', (e.clientX + tileOffset[0])+'px');
				$boundTile.css('top', (e.clientY + tileOffset[1])+'px');
				// console.log('['+(e.clientX - tileOffset[0])+', '+(e.clientY - tileOffset[1])+']');
				hit = document.elementFromPoint(e.clientX, e.clientY);
			}
			// if (hit && hit.nodeName=='CANVAS')
			if (hit && hit.nodeName=='DIV')
			{
				var $tile = $(hit);//.closest('.tile');
				if ($tile.hasClass('tile')==false)
					return;

				if ($tile.hasClass('complete'))
					return;

				if ($tile.length == 0)
					return;

				var hitIdx = self.getIndex($tile);
				var grabbedIdx = self.getIndex($boundTile);

				var hitIdxIdx = self.tileOrder.indexOf(hitIdx);
				var grabbedIdxIdx = self.tileOrder.indexOf(grabbedIdx);

				self.tileOrder[hitIdxIdx] = grabbedIdx;
				self.tileOrder[grabbedIdxIdx] = hitIdx;

				$tile.addClass('swapping');
				setTimeout(function(){ $tile.removeClass('swapping'); }, 300);

				// console.log('swapping ('+grabbedIdx+')['+self.tilePositions[grabbedIdx][0]+', '+self.tilePositions[grabbedIdx][1]+'] with ('+hitIdx+')['+self.tilePositions[hitIdx][0]+', '+self.tilePositions[hitIdx][1]+']');
				console.log(self.tileOrder);

				var tempPos = self.tilePositions[grabbedIdx];
				self.tilePositions[grabbedIdx] = self.tilePositions[hitIdx];
				self.tilePositions[hitIdx] = tempPos;

				$tile.css('left', tempPos[0]+'px');
				$tile.css('top', tempPos[1]+'px');
			}
			// console.log(hit);

			// console.log(e);
		}

		$tile.on('mousedown touchstart', function(e)
		{
			if (isDragging==true)
				return;

			var $this = $(e.target).closest('.tile');
			if ($this.hasClass('complete'))
			{
				isDragging = false;
				return;
			}
			$this.closest('.tile-wrapper').addClass('dragging');
			isDragging = true;
			$boundTile = $this;

			var pos = self.getPosition($boundTile);
			// console.log(pos);

			tileOrigPos = pos;
			// tileOrigPos[0] = $this.offset().left;
			// tileOrigPos[1] = $this.offset().top;

			if (e.type.toLowerCase() === 'touchstart')
			{
				tileOffset[0] = tileOrigPos[0] - e.originalEvent.touches[0].clientX;
				tileOffset[1] = tileOrigPos[1] - e.originalEvent.touches[0].clientY;
			}
			else
			{
				tileOffset[0] = tileOrigPos[0] - e.clientX;
				tileOffset[1] = tileOrigPos[1] - e.clientY;
			}

			$this.addClass('active');
			$('#tile-game .tile-wrapper').on('mousemove touchmove', handleMove);
		});

		function handleMouseUp(e)
		{
			if (isDragging==false)
				return;

			var $this = $(this);
			$this.closest('.tile-wrapper').removeClass('dragging');
			isDragging = false;
			$boundTile.removeClass('active');
			var pos = self.getPosition($boundTile);
			$boundTile.css('left', (pos[0])+'px');
			$boundTile.css('top', (pos[1])+'px');
			$boundTile = null;
			$('#tile-game .tile-wrapper').off('mousemove touchmove', handleMove);
			self.checkComplete();
		}

		$tile.on('mouseup touchend touchcancel', handleMouseUp);
		$('#tile-game .tile-wrapper').on('mouseup touchend touchcancel', handleMouseUp);
	}

};


function setupMenuAnimatic()
{
	var count = 0;
	var container = document.getElementById('menu-animatic');
	var menuAnimData = {
		container: container,
		// renderer: 'svg',
		renderer: 'canvas',
		loop: false,
		// prerender: false,
		prerender: true,
		autoplay: false,
		// autoloadSegments: false,
		autoloadSegments: true,
		path: 'Scripts/Scripts/menu-icon.json'
	};

	var menuAnim;
	// var isThrowing = false;


	menuAnim = bodymovin.loadAnimation(menuAnimData);
	// menuAnim.addEventListener('DOMLoaded',onLoad);
	$(document).load(function()
	{
		onLoad();
	});
	// document.getElementById('menu-icon').onclick = toggleXanim;
	$('#menu-icon').on('click', toggleXanim);

	// function throwComplete(){
	// 	isThrowing = false;
	// 	menuAnim.removeEventListener('loopComplete',throwComplete);
	// }

	function toggleXanim()
	{
		var $menu = $('#menu-animatic');
		menuAnim.setDirection(1);
		if ($menu.hasClass('open'))
		{
			menuAnim.playSegments([[73,110]],true);
			$menu.removeClass('open');
		}
		else
		{
			menuAnim.playSegments([[37,73]],true);
			$menu.addClass('open');			
		}
			// menuAnim.playSegments([[37,78]],true);
	}

	// function throwPancake(){
	// 	if(isThrowing){
	// 		return;
	// 	}
	// 	isThrowing = true;
	// 	menuAnim.playSegments([[27,142],[14,26]],true);
	// 	var baconRand = Math.random()*1420;
	// 	var butterXpos;
	//   if(baconRand < 1420/2){
	// 	butterXpos = 500 + 900 + Math.random()*900;
	//   } else {
	// 	butterXpos = 500 + Math.random()*900;
	//   }
	// 	var baconPos = [-100+baconRand,480+Math.random()*370,0];
	// 	var butterPos = [butterXpos,470+Math.random()*430,0];
	// 	menuAnim.layers[0].ks.p.k[0].e = baconPos;
	// 	menuAnim.layers[2].ks.p.k[0].e = baconPos;
	// 	menuAnim.layers[1].ks.p.k[0].e = butterPos;
	// 	menuAnim.layers[3].ks.p.k[0].e = butterPos;
	// 	menuAnim.addEventListener('loopComplete',throwComplete);
	// }

	// function startAnimation(){
	// 	menuAnim.playSegments([[0,26],[14,26]],true);
	// }

	function onLoad(){
		menuAnim.goToAndStop(37,true);
	}
}

$(document).ready(function()
{
	setupMenuAnimatic();
	setupRevealMasks();
	setupSprites();

	TileGame.init();
	TileGame.resize();
	TileGame.addEvents();

	var $body = $('body');
	var isResizing = false;
	$(window).on('resize', function()
	{
		isResizing = true;
		$body.addClass('resizing');
		TileGame.resize();
		setTimeout(function()
		{
			if (isResizing)
				return;
			$body.removeClass('resizing');
		}, 100);
		isResizing = false;
	});


	function handleCanvases(index, el)
	{
		var canvasIdx = $(el).attr('data-canvas') || 0;
		var canvas = globalCanvasList[canvasIdx];

		canvas.clear();
		canvas.resetMask();

		function drawFrame(timestamp)
		{
			// console.log('drawing frame');
			canvas.setTime(timestamp);
			canvas.draw(timestamp);
		}
		canvas.completeCallback = function() { stopAnimationUpdates(drawFrame); }

		startAnimationUpdates(drawFrame);
	}

	var animateHandlers = {
		'origin': function()
		{
			$('section.origin .reveal-mask').each(handleCanvases);
		},
		
		'fischer-ingredients': function()
		{
			$('section.fischer-ingredients .reveal-mask').each(handleCanvases);
		},

		'fischer-news': function()
		{
			$('section.fischer-news .reveal-mask').each(handleCanvases);
			$('section.fischer-news .sprite').each(function(index, el)
			{
				var canvasIdx = $(el).attr('data-canvas') || 0;
				var canvas = globalCanvasList[canvasIdx];
				canvas.recalcSize();

				handleCanvases(index, el);
			} );
		}
	}

	var prevFiredHandler = [];

	$(window).on('onAnimate', function(e, map)
	{
		if (!map || !map.list)
			return;
		var newHandlers = [];
		for (var i = 0; i < map.list.length; i++)
		{
			var $obj = $(map.list[i]);
			for (var handler in animateHandlers)
			{
				if ($obj.hasClass(handler))
				{
					newHandlers.push(handler);
					if (prevFiredHandler.indexOf(handler) > -1 )
					{
						// console.log(handler+' already fired');
						continue;
					}
					console.log('firing onAnimate for '+handler);
					animateHandlers[handler]();

					// prevFiredHandler.push(handler);
				}
			}
		}

		prevFiredHandler = newHandlers;
		// console.log(newHandlers);
	} );

	// \Content\Files
	// var animData = {
	// 	wrapper: document.getElementById('bodymovin-wrapper'),
	// 	// animType: 'html',
	// 	// animType: 'svg',
	// 	animType: 'canvas',
	// 	loop: true,
	// 	prerender: true,
	// 	autoplay: true,
	// 	// path: '../../Content/Files/burger.json'
	// 	// path: '../../Content/Files/stahi-loader.json'
	// 	path: 'scripts/Scripts/burger.json'
	// 	// path: 'scripts/Scripts/stahi-loader-2.json'

	// };
	// var anim = bodymovin.loadAnimation(animData);
});




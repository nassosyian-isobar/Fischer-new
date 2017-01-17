// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	// window._requestAnimationFrame = null;
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
								   || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	window._requestAnimationFrame = window.requestAnimationFrame;
	window._cancelAnimationFrame = window.cancelAnimationFrame;
 
	// if (!window._requestAnimationFrame)
	if (!window.requestAnimationFrame)
	{
		console.log('requestAnimationFrame not supported, using polyfill');
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
		window.requestAnimationFrame = window._requestAnimationFrame;
	}
 
	if (!window._cancelAnimationFrame)
	{
		console.log('cancelAnimationFrame not supported, using polyfill');
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
		window.cancelAnimationFrame = window._cancelAnimationFrame;
	}


	window.__animFrameCmds = [];

	function _animFrameLoop(timestamp)
	{
		if (window.__animFrameCmds.length > 0)
			requestAnimationFrame(_animFrameLoop);

		for (var i = 0; i < window.__animFrameCmds.length; i++)
		{
			window.__animFrameCmds[i] && window.__animFrameCmds[i](timestamp);
		}
	}


	function startAnimationUpdates(callback)
	{
		// console.log('startAnimating callback');
		window.__animFrameCmds.push(callback);

		if (window.__animFrameCmds.length == 1)
		{
			requestAnimationFrame(_animFrameLoop);
		}
	}
	window.startAnimationUpdates = startAnimationUpdates;

	function stopAnimationUpdates(callback)
	{
		var idx = window.__animFrameCmds.indexOf(callback);
		// console.log('stopAnimating callback at index '+idx);

		if (idx > -1)
		{
			window.__animFrameCmds.splice(idx, 1);
		}
	}
	window.stopAnimationUpdates = stopAnimationUpdates;

	function onceAnimationUpdate(callback)
	{
		function _do_once(timestamp)
		{
			callback && callback(timestamp);
			stopAnimationUpdates(_do_once);
		}

		startAnimationUpdates(_do_once);
	}
	window.onceAnimationUpdate = onceAnimationUpdate;
	

}());
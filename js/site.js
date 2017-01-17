'use strict';


var canvas = null;

var scene = null;
var camera = null;
var renderer = null;

var geometry = null;
var material = null;
var mesh = null;

var bubbleAudio = null;
var bubbleSprites = {
	// one: [20, (250-20)],
	// two: [400, (650-400)],
	// three: [750, (1000-750)],
	// four: [1200, (1500-1200)],
	// five: [1650, (1900-1650)],
	// six: [2000, (2250-2000)],
	// seven: [2400, (2600-2400)],
	// eight: [2800, (3000-2800)],
	// nine: [3050, (3250-3050)]
	one: [330, (560-300)],
	two: [560, (810-560)],
	three: [890, (1050-890)],
	four: [1130, (1340-1130)],
	five: [1340, (1580-1340)],
	six: [1680, (1910-1680)],
	seven: [1970, (2260-1970)],
	eight: [2300, (2670-2300)],
	nine: [2740, (3080-2740)],
	ten: [3330, (3610-3330)],
	eleven: [3700, (3980-3700)],
	twelve: [4040, (4440-4040)],
	thirteen: [4670, (4870-4670)],
	fourteen: [4900, (5090-4900)],
	fiftheen: [5120, (5400-5120)],
	sixteen: [5600, (5780-5600)],
	seventeen: [5780, (5990-5780)],
	eighteen: [5990, (6190-5990)],
	nineteen: [6190, (6400-6190)],
	twenty: [6540, (6830-6540)]
};
var bubbleSpriteNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fiftheen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
// var bubbleSprites = {
// 	'0': [20, 250],
// 	'1': [400, 650],
// 	'2': [750, 1000],
// 	'3': [1200, 1500],
// 	'4': [1650, 1900],
// 	'5': [2000, 2250],
// 	'6': [2400, 2600],
// 	'7': [2800, 3000],
// 	'8': [3050, 3250]
// };
// var bubbleSprites = [
// 	[20, 250],
// 	[400, 650],
// 	[750, 1000],
// 	[1200, 1500],
// 	[1650, 1900],
// 	[2000, 2250],
// 	[2400, 2600],
// 	[2800, 3000],
// 	[3050, 3250]
// ];
var bubbleSpriteIndex = 0;

var mousedown = false;

var x_bubble_count = 0;
var total_bubble_count = 0;
var burst_count = 0;

// var burst_count = 0;
var prev_burst_count = 0;



var firebase_config = {
		apiKey: "AIzaSyCTyVSKFs0GjRqRXisS6o-XHeS0FV26P1w",
		// authDomain: "<PROJECT_ID>.firebaseapp.com",
		databaseURL: "https://bubble-wrap-4f5c8.firebaseio.com/"
		// storageBucket: "<BUCKET>.appspot.com",
		// messagingSenderId: "<SENDER_ID>",
	};


var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
var isFirefox = /Firefox/.test(navigator.userAgent) && /Gecko/.test(navigator.userAgent);
var isEdge = /Edge\/\d./i.test(navigator.userAgent);
var isTrident = /Trident\/\d./i.test(navigator.userAgent);
var isOldIE = /MSIE 10\/\d./i.test(navigator.userAgent) || /MSIE 9\/\d./i.test(navigator.userAgent) || /MSIE 8\/\d./i.test(navigator.userAgent);

var isWebkit = isChrome || isSafari;



function addBrowserClasses()
{

	if (isFirefox)
		$('body').addClass('firefox');

	if (isTrident)
	{
		$('body').addClass('trident');
		var idx = navigator.userAgent.indexOf('Trident/')+'Trident/'.length;

		if (isOldIE)
			$('body').addClass('oldie');
	}

	if (isEdge)
	{
		$('body').addClass('edge')
				.removeClass('trident');
		console.log('Edge browser detected.');
	}


	if (isSafari)
		$('body').addClass('safari');

	if (isChrome)
		$('body').addClass('chrome');

}

addBrowserClasses();


//===========================================================

function calc_x_stripe()
{
	var prev_y = 0;
	x_bubble_count = 0;

	$('.bubbles-wrapper ul > li').each(function(index, el)
	{
		var $el = $(el);
		var top = $el.offset().top;

		if (top !== prev_y)
		{
			return false;
		}
		else
		{
			x_bubble_count++;
		}

	});

	console.log('x_bubble_count :'+x_bubble_count);
}


function addBubbleElements()
{
	var dim = 50;

	var winWidth = $(window).width();
	var winHeight = $(window).height();

	if ( $('html').hasClass('mobile') )
		winHeight *= 2;

	var x_count = winWidth / 50;
	x_count = Math.ceil(x_count)+1;

	var y_count = winHeight / 50;
	y_count = Math.ceil(y_count)+1;

	var count = x_count * y_count;
	var $bubbleWrapper = $('.bubbles-wrapper ul');

	total_bubble_count = count;

	var existing_count = $('.bubbles-wrapper ul > li').length;

	var rem = count - existing_count;

	for (var i = 0; i < rem; i++)
		$bubbleWrapper.append(document.createElement('li'));
		// $bubbleWrapper.append('<li><span></span></li>');

	calc_x_stripe();
	addEvents();
}

function playBubbleBurst()
{
	// bubbleAudio.play(''+bubbleSpriteIndex);
	// bubbleAudio.play('1');
	bubbleAudio.play(bubbleSpriteNames[bubbleSpriteIndex]);
	// console.log('playing burst '+bubbleSpriteIndex);
	// console.log('playing burst '+bubbleSpriteNames[bubbleSpriteIndex]);
	bubbleSpriteIndex = (bubbleSpriteIndex+1) % 9;
}

function setupAudio()
{
	// var audioSrc = './audio/bubble-wrap.mp3';
	// var audioSrc = './audio/bubble-wrap_02.mp3';
	var audioSrc = './audio/bubble-wrap-new_01.mp3';
	var x_count = 0;

	bubbleAudio = new Howl({
			src: audioSrc,
			autoplay: false,
			loop: false,
			preload: true,
			sprite: bubbleSprites
			// ,
			// onplay: handleMute
		});
}

var desktop_percentages = [0.07, 0.3, 0.6];
var mobile_percentages = [0.15, 0.35, 0.50];

var percentages = $('html').hasClass('mobile') ? mobile_percentages : desktop_percentages;
var percent_pos = 0;
var msg_count = 0;

function addEvents()
{

	function _handleMouseDown(e)
	{
		mousedown = true;
	}

	function _handleMouseUp(e)
	{
		mousedown = false;
	}

	function _handleMouseMove(e)
	{
		if (mousedown)
		{
			var $this = $(this);
			e.preventDefault();
			
			var x = e.clientX;
			var y = e.clientY;
			var bubbleEl = document.elementFromPoint(x, y);
			var $this = $(bubbleEl);
			// console.log('_handleMouseMove['+$this.index()+'] mousedown['+(mousedown ? 1 : 0)+']');

			if ( $this.hasClass('blown') == false )
				$this.trigger('click');
		}
	}

	function _handleTouchMove(e)
	{
		e.preventDefault();

		if (mousedown)
		{
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			var x = touch.pageX;
			var y = touch.pageY;
			var bubbleEl = document.elementFromPoint(x, y);
			var $this = $(bubbleEl);
			// console.log('_handleTouchMove['+$this.index()+'] mousedown['+(mousedown ? 1 : 0)+']');

			if ( $this.hasClass('blown') == false )
				$this.trigger('click');
		}
	}


	$('.bubbles-wrapper ul > li').off('mouseenter').on('mouseenter', function(e)
	{
		var $this = $(this);
		// $this.children('span').velocity({opacity:[1, 0], duration: 20});
		$this.children('span').css('opacity', 1);
		// setTimeout(function(){
		// 	$this.addClass('leave');
		// }, 100);
	});

	$('.bubbles-wrapper ul > li').off('mouseleave').on('mouseleave', function(e)
	{
		var $this = $(this);
		$this.children('span').velocity({opacity:[0, 1], duration: 800});
		// setTimeout(function(){
		// 	$this.removeClass('leave');
		// }, 800);
	});


	$('.bubbles-wrapper ul > li').off('mousedown').on('mousedown', _handleMouseDown);
	$('.bubbles-wrapper ul > li').off('touchstart').on('touchstart', _handleMouseDown);
	// $('.bubbles-wrapper ul > li').off('touchstart').on('touchstart', function(e)
	// {
	// 	var $this = $(this);
	// 	if ( $this.hasClass('blown') == false )
	// 		$this.trigger('click');
	// });

	$('.bubbles-wrapper ul > li').off('mouseup').on('mouseup', _handleMouseUp);
	$('.bubbles-wrapper ul > li').off('touchend').on('touchend', _handleMouseUp);
	$('.bubbles-wrapper ul > li').off('touchcancel').on('touchcancel', _handleMouseUp);

	if ($('html').hasClass('desktop'))
		$('.bubbles-wrapper ul ').off('mousemove').on('mousemove', _handleMouseMove);
		// $('.bubbles-wrapper ul > li').off('mouseenter').on('mouseenter', _handleMouseEnter);

	// $('.bubbles-wrapper ul').off('touchmove').on('touchmove', _handleTouchMove);

	var msgs = ['Βλέπουμε σκας για το πάρτι!', 'Συνέχισε, έχεις ακόμα!', 'Με refresh, μπορείς να σκας μέχρι την Πέμπτη!'];



	$('.bubbles-wrapper ul > li').off('click').on('click', function(e)
	{
		var $this = $(this);
		if ( $this.hasClass('blown') == false )
		{
			playBubbleBurst();
			$this.addClass('blown');
			burst_count++;

			if (burst_count == Math.round(total_bubble_count * percentages[percent_pos])  )
			{
				$('#popup .text p').text(msgs[msg_count]);
				msg_count++;
				percent_pos++;
				percent_pos = Math.min(percent_pos, percentages.length-1);
				$('body').addClass('show-popup');
			}

			// if ( $('html').hasClass('mobile')==false )
			// {
			// 	if (burst_count == Math.round(total_bubble_count * 0.07) ||
			// 		burst_count == Math.round(total_bubble_count * 0.3) ||
			// 		burst_count == Math.round(total_bubble_count * 0.6)  )
			// 	{
			// 		$('#popup .text p').text(msgs[msg_count]);
			// 		msg_count++;
			// 		$('body').addClass('show-popup');
			// 	}
			// }
			// else
			// {
			// 	if (burst_count == Math.round(total_bubble_count * 0.15) ||
			// 		burst_count == Math.round(total_bubble_count * 0.25) ||
			// 		burst_count == Math.round(total_bubble_count * 0.35)  )
			// 	{
			// 		$('#popup .text p').text(msgs[msg_count]);
			// 		msg_count++;
			// 		$('body').addClass('show-popup');
			// 	}
			// }

		}
	});

}

var sessionRef = null;
function setupDB()
{
	if (typeof firebase === 'undefined')
	{
		console.log('firebase is not defined');
		return;
	}

	firebase.initializeApp(firebase_config);
	var db = firebase.database();

	sessionRef = db.ref('session_list').push();
	var currentTimestamp = new Date().getTime();
	sessionRef.update({
		"userAgent": navigator.userAgent,
		"beginTime" : currentTimestamp,
		"lastUpdate" : '-',
		"bursts" : 0,
		"device" : ($('html').attr('class') || ''),
	});

	var totalBurstsRef = db.ref('totalBursts');
	var timeToNext = 3*1000;
	var isRegistering = false;

	function registerBursts()
	{
		var to_write = burst_count;

		if (isRegistering)
			return;

		if (to_write !== prev_burst_count)
		{
			isRegistering = true;
			totalBurstsRef.transaction(function(currentData) 
			{
				return currentData + (to_write - prev_burst_count);
			}, 
			function(error, committed, snapshot) 
			{
				if (error) 
				{
					console.log('Transaction failed abnormally! ', error);
				} 
				else if (!committed) 
				{
					console.log('Transaction was aborted (because it already exists).');
				} 
				else 
				{
					console.log('Burst count updated by '+(to_write - prev_burst_count)+'!');
					prev_burst_count = to_write;

					sessionRef.update({
						"bursts" : to_write,
						"lastUpdate" : new Date().getTime()
					});

				}
				isRegistering = false;
				setTimeout(registerBursts,	timeToNext);
				console.log("totalBursts: ", snapshot.val());
			});
		}
		else
		{
			setTimeout(registerBursts,	timeToNext);
		}
	}

	setTimeout(registerBursts,	timeToNext);

}

function onReady()
{
	FastClick.attach(document.body);
	addBubbleElements();
	setupAudio();

	$('#popup .close').on('click', function(e)
	{
		$('body').removeClass('show-popup');
	});

	$(window).on('resize', function()
	{
		addBubbleElements();
		// calc_x_stripe();
		setTimeout(calc_x_stripe, 1000);
	});

	if ( $('html').hasClass('mobile') )
	{
		$('#arrow').on('click', function(e)
		{
			var $body = $("html, body");
			$body.stop().animate({scrollTop: $(window).height() }, '500', 'swing', function() { 
				 console.log("Finished animating");
			});
		});

		$(window).on('scroll', function(e)
		{
			$('#arrow').addClass('scrolled');
			$(window).off('scroll');
		});
	}

	setupDB();

}

// $(document).load(
window.addEventListener('load', function()
	{
		$('body').removeClass('loading');
	}, false);
	// document.onload = function()
	// {
	// 	$('body').removeClass('loading');
	// };
// );


onReady();




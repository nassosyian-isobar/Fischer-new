/* FUNCTIONS */

function check_if_in_viewport() {
	var cur_pos = $(window).scrollTop();

	var list = [];

	$('.anim-elm').each(function () 
	{
		var top = $(this).offset().top;
		var winHeight = $(window).height();

		// if (cur_pos + winHeight >= $(this).offset().top + winHeight*0.2)
		if (cur_pos + winHeight*0.5 >= $(this).offset().top)
		// if (cur_pos <= top && cur_pos + $(window).height() >= $(this).offset().top - $(window).height() * 0.2) 
		{
			$(this).addClass('animated');
			list.push(this);
		} 
		else 
		{
			$(this).removeClass('animated');
		}
	});

	if (list.length > 0)
		$(window).trigger('onAnimate', {list: list} );
}

$.fn.equalHeights = function () {
	var maxHeight = 0,
		$this = $(this);

	$this.each(function () {
		$this.height('auto');
		var height = $(this).outerHeight();

		if (height > maxHeight) { maxHeight = height; }
	});

	return $this.css('height', maxHeight);
};

function check_section() {
	var cur_pos = $(window).scrollTop(), dataSection;

	if ($('.section-nav').length > 0 && cur_pos < 2) 
	{
		$('.anim-section').each(function()
		{
			$(this).removeClass('animated');
		});
	} else {
		$('.anim-section').each(function () {
			if (cur_pos + $(window).height() >= $(this).offset().top + $(window).height() * 0.6) 
			{
				$(this).addClass('active');
				dataSection = $(this).data('section');
				dataSectionTitle = $(this).data('section-title');
				sectionNav.setActive(dataSection);
				sectionNav.setActiveText(dataSectionTitle);
			}
			else 
			{
				$(this).removeClass('active');
			}
		});
	}
}

var mainMenu = {
	_this: this,
	menuOpen: '.menu-open',
	menuClose: '.menu-close',
	openMenu: function(){
		$('.nav-trigger').addClass('opened');
		$('.main-nav').addClass('opened');
	},
	closeMenu: function(){
		$('.nav-trigger').removeClass('opened');
		$('.main-nav').removeClass('opened');
	},
	init: function(){
		$('.menu-open').on('click', function(){
			mainMenu.openMenu();
		});
		$('.menu-close').on('click', function(){
			mainMenu.closeMenu();
		});
	}
};


/* SECTION NAVIGATION */
var sectionNav = {
	setActive: function(el){
		$('.section-nav [data-section-trigger="' + el + '"]').addClass('active').siblings().removeClass('active');
	},
	goToSection: function(){
		var sectionToGo, top;
		$('.section-nav li').on('click', function(e){
			e.preventDefault();
			sectionNav.setActive($(this).data('section-trigger'));
			$(this).addClass('active').siblings().removeClass('active');
			sectionToGo = $(this).data('section-trigger');
			top = $('[data-section="'+ sectionToGo +'"]').offset().top ;
			$('body,html').animate({scrollTop: top}, 600);
		});
	},
	setActiveText: function(el) 
	{
		$('.section-nav > span').text(el);
	},
	checkStatus: function()
	{
		if ($('.intro-game').hasClass('open'))
		{
			$('.section-nav').addClass('hidden');
		} 
		else 
		{
			$('.section-nav').removeClass('hidden');
		}
	}
};

/* AUDIO */
function mediaPlayer(playerid)
{
	if (!playerid) {
		return false;
	}

	var mediaPlayer = document.getElementById(playerid);
	if (!mediaPlayer) {
		return false;
	}

	var playPause = mediaPlayer.querySelector('.controls-play-pause'),
		stop = mediaPlayer.querySelector('.controls-stop'),
		controls = mediaPlayer.querySelector('.media-player-controls'),
		target =  mediaPlayer.dataset.target,
		media = document.getElementById(target);

	//init
	media.controls = false;

	//play/pause
	function isPlaying() {
		return !media.paused;
	}

	function configPlayPauseButton(){
		if (isPlaying()) {
			playPause.classList.remove('face-play');
			playPause.classList.add('face-pause');
		} else {
			playPause.classList.remove('face-pause');
			playPause.classList.add('face-play');
		}
	}

	playPause.addEventListener('click', function(){
		if (!isPlaying()) {
			media.play();
		} else {
			media.pause();
		}
		configPlayPauseButton();
	});

	stop.addEventListener('click', function(){
		if (isPlaying()) {
			media.pause();
			media.currentTime = 0;
		}
	});



} /* end of mediaplayer*/

/* SHYFFLE FUNCTION */
(function($){

	$.fn.shuffle = function() {

		var allElems = this.get(),
			getRandom = function(max) {
				return Math.floor(Math.random() * max);
			},
			shuffled = $.map(allElems, function(){
				var random = getRandom(allElems.length),
					randEl = $(allElems[random]).clone(true)[0];
				allElems.splice(random, 1);
				return randEl;
			});

		this.each(function(i){
			$(this).replaceWith($(shuffled[i]));
		});

		return $(shuffled);

	};

})(jQuery);

/* INTRO GAME */
var introGame = {
	skip: function(){
		$('body').on('click', '.intro-game .skip', function(){
			$('.intro-game').removeClass('open');
			$('#audioPlayer .controls-stop').trigger('click');
			$('.controls-play-pause').removeClass('face-pause').addClass('face-play');
			$(this).fadeOut('600');
			$('.section-nav li').eq(1).trigger('click');
			$('.anim-section').each(function(){
				$(this).removeClass('animated');
			});
			$('.section-nav').removeClass('hidden');
		});

	},
	shuffleTile: function(){
		$('.intro-game .tile-box').shuffle();
	},
	checkLocked: function(){
		$('.tile-box').each(function(){
			if ($(this).data('tile') === $(this).index() ) {
				$(this).addClass('locked');
			} else {
				$(this).removeClass('locked');
			}
		});
	},
	init: function(){

		// $('.intro-game .tiles-container-inner').sortable({
		// 	items: ".tile-box:not(.locked)",
		// 	delay: 200,
		// 	revert: true,
		// 	revertDuration: 600,
		// 	update: function(event, ui) {

		// 		var circStep = 0;
		// 		$('.tile-box').each(function(){
		// 			if ($(this).data('tile') === $(this).index() ) {
		// 				introGame.checkLocked();
		// 				circStep++;
		// 			}
		// 		});

		// 		circular.step(circStep);

		// 		if (circStep === 6) {
		// 			// setTimeout(function(){
		// 			//     $('.intro-game .skip').trigger('click');
		// 			// },4000);
		// 			setTimeout(function(){ alert("Hello"); }, 3000);
		// 		}
		// 	}
		// });
		$(".intro-game .tiles-container-inner").disableSelection();
		introGame.skip();
		introGame.shuffleTile();
	}

};

var closeAgeGating = function(){
	$('.age-gating').fadeOut(800, function(){
		$(this).removeClass('open');
	})
};

/* CALL PLAYER FUNCTION */
function callPlayer(iframe, func, args) {
	if ( iframe.src.indexOf('youtube.com/embed') !== -1) {
		iframe.contentWindow.postMessage( JSON.stringify({
			'event': 'command',
			'func': func,
			'args': args || []
		} ), '*');
	}
}

/* NEWS FILTERS */
var newsFilters = function(){
	$('.filter-box').owlCarousel({
		items: 2,
		itemsTablet: [1040,2],
		itemsMobile: [767, 2],
		navigation: true,
		pagination: false,
		navigationText: ["<span class='icon-arrow-left'></span>","<span class='icon-arrow-right'></span>"],
		rewindNav: false
	});

	$('body').on('click','.filter-box .owl-item', function(){
		$('.filters .filter-all').removeClass('selected');
		$(this).addClass('selected').siblings().removeClass('selected');
	});

	$('body').on('click', '.filters .filter-all', function(){
		$(this).addClass('selected');
		$('.filter-box .owl-item').removeClass('selected');
	})
};

$.preloadImages = function() {
	for (var i = 0; i < arguments.length; i++) {
		$("<img />").attr("src", arguments[i]);
	}
};

var changeBgImage = function(el){
	var dataImg, curImg;
	$(el).hover(function(){
		curImg = $(this).data('image');
		dataImg = $(this).data('alt-image');
		$(this).css({'background-image': 'url(' + dataImg + ')'});
	}, function(){
		$(this).css({'background-image': 'url(' + curImg + ')'});
	});

};

var galleryCarousel = {
	thumb: '.gallery-thumb',
	mainImage: '.gallery-main-image figure',
	changeImage: function(){
		var bigImg;
		$('body').on('click', this.thumb, function(){
			bigImg = $(this).data('big-image');
			$(this).addClass('active').siblings().removeClass('active');
			$('.gallery-main-image figure').css({'background-image': 'url(' + bigImg + ')'});
		});
	},
	setScrollbar: function(){
		$(".gallery-thumbs-container").perfectScrollbar({
			wheelPropagation: true,
			swipePropagation: true,
			maxScrollbarLength: 15,
			suppressScrollY: true
		});
	},
	//setPan: function(){
	//    var gallerThumbs  =  document.getElementById('galThumbs');
	//
	//    Hammer(gallerThumbs).on('swiperight', function(){
	//        //console.log('swipe right');
	//        $(".gallery-thumbs-container").trigger('ps-scroll-right');
	//    });
	//
	//    Hammer(gallerThumbs).on('swipeleft', function(){
	//        $(".gallery-thumbs-container").trigger('ps-scroll-left');
	//    });
	//
	//},
	init: function(){
		this.setScrollbar();
		this.changeImage();
		//this.setPan();
	}
};

var timelineCarousel = function(){

	if($('.timeline-row').length < 1) return;

	wWidth = window.innerWidth;

	if(wWidth < 768){
		$('.timeline-row').owlCarousel({
			singleItem: true,
			navigation: false,
			pagination: false
		});
	}
	else {
		/*if(wWidth >= 768 && $('.timeline-row').data('owlCarousel')){*/
		if(wWidth >= 768 && $('.timeline-row.owl-carousel').length > 0){
			$('.timeline-row.owl-carousel').each(function(){
				$(this).data('owlCarousel').destroy();
			});
		}
	}
};

var timelineInfoEq = function(){
	if ($(window).width() < 768) {
		$('.timeline-row .squared-info').equalHeights();
	} else {
		$('.timeline-row .squared-info').height('');
	}
};

/* production carousel */
var productCarousel = function(){
	var $prodSlider = $('.product-carousel');

	$prodSlider.owlCarousel({
		singleItem: true,
		navigation: false,
		addClassActive: true,
		dragBeforeAnimFinish : false,
		rewindSpeed: 6000,
		scrollPerPage: true,
		navigationText: ['<span class="icon-arrow-left"></span>','<span class="icon-arrow-right"></span>'],
		afterAction: function() {
			$('.product-carousel .owl-item.active video').get(0).play();
		}
	});
};

var beerCarousel = function(){
	if($('.beer-carousel').length < 1) return;

	wWidth = window.innerWidth;

	if(wWidth < 768){
		$('.beer-carousel').owlCarousel({
			singleItem: true,
			navigation: false,
			pagination: false,
			addClassActive: true
		});
	}
	else {
		/*if(wWidth >= 768 && $('.timeline-row').data('owlCarousel')){*/
		if(wWidth >= 768 && $('.beer-carousel.owl-carousel').length > 0){
			$('.beer-carousel.owl-carousel').each(function(){
				$(this).data('owlCarousel').destroy();
			});
		}
	}
};

var changeTranslate = function(el, speed) {
	$(el).css({
		transform: "translateY(-" + speed + "px)",
		"-webkit-transform": "translateY(-" + speed + "px)",
		"-moz-transform": "translateY(-" + speed + "px)",
		"-o-transform": "translateY(-" + speed + "px)",
		"-ms-transform": "translateY(-" + speed + "px)"
	});
};

var parallax_fx = function(st){
	if ($('.desktop .ingredient-box figure .brush').length > 0) {
		var sTop = $(window).scrollTop(),
			s1 =  sTop * .06,
			s2 = sTop * .09,
			s3 = sTop * .08,
			s4 = sTop * .07,
			s5 = sTop * .04,
			top = $('.desktop .fischer-ingredients').offset().top - sTop;

		if (top < 350 && top > -1150) {
			changeTranslate('.desktop .ingredient-box.vini figure .brush', s1);
			changeTranslate('.desktop .ingredient-box.water figure .brush', s2);
			changeTranslate('.desktop .ingredient-box.likiskos figure .brush', s3);
			changeTranslate('.desktop .ingredient-box.magia figure .brush', s4);
			changeTranslate('.col-beer', s5);
		}
	}
};

/* check logo visibility */
var checkLogo = function(){
	var $mobileLogo = $('.mobile-logo');
	if ($('.intro-game').length > 0) {
		var top = $(window).scrollTop(),
			h = $('.intro-game').outerHeight(),
			$mainLogo = $('.main-logo');

		if (top < h) {
			$mainLogo.addClass('hidden');
			$('.mobile-logo').addClass('hidden-mob');
		} else {
			$mainLogo.removeClass('hidden');
			$('.mobile-logo').removeClass('hidden-mob');
		}
	}

	var wWidth = $(window).width(),
		sTop = $(window).scrollTop(),
		h = $('.nav-trigger').height();
	if (wWidth <= 900 && $mobileLogo.length > 0) {
		if (sTop > h) {
			$('.mobile-logo:not(.hidden)').addClass('hidden');
		} else {
			$('.mobile-logo.hidden').removeClass('hidden');
		}
	}

};

var openLightbox = function() {
	var lbCont;
	$('body').on('click', '[data-lb-trigger]', function(e){
		e.preventDefault();
		lbCont = $(this).data('lb-trigger');
		$('[data-lb-content="'+ lbCont +'"]').addClass('open');
	});
};
var img, pic_real_width, pic_real_height, tWidth, tHeight, origRatio, newHeight;
var getOriginalSize = function(){
	img = $('.intro-game-tile img');

	$("<img/>") // Make in memory copy of image to avoid css issues
		.attr("src", img.attr("src"))
		.load(function() {
			pic_real_width = this.width;   // Note: $(this).width() will not
			pic_real_height = this.height; // work for in memory images.

			tWidth = pic_real_width * 3;
			tHeight = pic_real_height * 2;
			origRatio = tWidth/tHeight;
			newHeight = window.innerWidth / getOriginalSize();
			if (newHeight < window.innerHeight) {
				$('.tiles-container').addClass('width');
			}else if(window.innerWidth > 2028){
				$('.tiles-container').addClass('max');
			}
		});
	return origRatio;
};

var getOriginalSizeRes = function(){
	newHeight = window.innerWidth / getOriginalSize();

	if (newHeight < window.innerHeight) {
		$('.tiles-container').addClass('width');
	} else {
		$('.tiles-container.width').removeClass('width');
	}

	if(newHeight > window.innerHeight && window.innerWidth > 2028){
		$('.tiles-container').addClass('max');
	}else{
		$('.tiles-container').removeClass('max');
	}

};

var changeGameImg = function(){
  var dataDeskSrc, dataMobSrc, $gameImg = $('.intro-game-tile img');

	$gameImg.each(function(){
		dataDeskSrc = $(this).data('desktop-img');
		dataMobSrc = $(this).data('mob-img');
		if ($(window).width() <= 768 && $(window).width() < $(window).height()) {
			$(this).attr('src', dataMobSrc);
		} else {
			$(this).attr('src', dataDeskSrc);
		}
	});
};



/* START OF DOCUMENT READY */
$(function() {
	mainMenu.init();

	check_if_in_viewport();

	// var img1, img2;
	// $('.fischer-taste figure').each(function(){
	// 	img1 = $(this).data('image');
	// 	img2 = $(this).data('alt-image');
	// 	$.preloadImages(img1,img2);
	// });


	/* SECTION NAV */
	sectionNav.goToSection();
	sectionNav.checkStatus();

	/* INTRO GAME */
	introGame.init();

	/* check if the section is in viewport */
	check_section();

	/* newsletter form effect */
	$('.newsletter-form .field input').focus(function(){
		$(this).parents('.newsletter-form').find('.submit').addClass('focused');
	});

	$('.newsletter-form .field input').focusout(function(){
		if ($(this).val() === '') {
			$(this).parents('.newsletter-form').find('.submit').removeClass('focused');
		}
	});

	/* video player */
	var dataVidId;
	$('.video-container .video-cover').on('click', function(e){
		$(this).parents('.video-container').addClass('open');
		dataVidId = '#'+$(this).data('video-id');
		callPlayer($(dataVidId)[0], 'playVideo');
	});

	/* BACK TO TOP */
	$('.back-top').on('click', function(e){
		$('html,body').animate({scrollTop: 0}, 1200);
	});

	/* NEWS FILTERS */
	newsFilters();

	// changeBgImage('.fischer-taste figure');

	galleryCarousel.init();

	/* TIMELINE CAROUSEL */
	timelineCarousel();

	/* product carousel */
	productCarousel();

	/* beer carousel */
	beerCarousel();

	$('.form input, .form textarea').focus(function(){
		$(this).parent().addClass('focus');
	});

	$('.form input, .form textarea').focusout(function(){
		$(this).parent().removeClass('focus');
	});

	/* check logo */
	checkLogo();

	/* perfect scrollbar on lightbox content */
	var $lbContent = $('.lightbox-content .inner-content');
	if ($lbContent.length > 0) {
		$lbContent.perfectScrollbar();
	}

	var $contContainer = $('.content-container .inner-content');
	if ($contContainer.length > 0) {
		$contContainer.perfectScrollbar();
	}

	// open lightbox
	openLightbox();


	var animData = {
		container: document.getElementById('loader-icon'),
		renderer: 'svg',
		loop: true,
		autoplay: true,
		path: 'Scripts/Libraries/data.json'
	};
	var anim = bodymovin.loadAnimation(animData);

	changeGameImg();

	introGame.checkLocked();
}); /* end of document resz */

/* WINDOW LOAD */
$(window).load(function(){
	/* timeline info boxes equal heights */
	timelineInfoEq();

	/* HOMEPAGE AUDIO */
	mediaPlayer('audioPlayer');

	getOriginalSize();

	$('.main-loader-container').fadeOut(400);

});
/* end of WINDOW LOAD */

function resizeEvents(){
	/* Check active section */
	check_section();

	/* TIMELINE CAROUSEL */
	timelineCarousel();

	/* timeline info boxes equal heights */
	timelineInfoEq();

	/* beer carousel */
	beerCarousel();

	getOriginalSizeRes();

	changeGameImg();
}

function scrollEvents(){
	check_if_in_viewport();

	/* check if the section is in viewport */
	check_section();

	/* homepage parallax */
	parallax_fx();

	/* check logo */
	checkLogo();
}

function resizeDelayEvents(){

}

var EventHandler = (function() {

	var callbacks = [],
		running = false,
		timers = {},
		delayedCallbacks = [];

	// fired on resize event

	function FiredEvent() {
		if (!running) {
			running = true;

			startAnimationUpdates(runCallbacks);
			// if (window.requestAnimationFrame) {
			// 	window.requestAnimationFrame(runCallbacks);
			// } else {
			// 	setTimeout(runCallbacks, 66);
			// }
		}
	}

	// run the actual callbacks
	function runCallbacks() {
		callbacks.forEach(function(callback) {
			callback();
		});

		delayedCallbacks.forEach(function(dcallback) {
			var uid = dcallback.uid;
			var ms = dcallback.delay;
			if (timers[uid]) {
				clearTimeout(timers[uid]);
			}
			timers[uid] = setTimeout(function(){
				dcallback.callback()
			}, ms);
		});
		running = false;
	}

	// adds callback to loop
	function addCallback(callback) {
		if (callback) {
			callbacks.push(callback);
		}
	}

	function CallbackDetails(callback, delay, uid) {
		this.callback = callback;
		this.delay = delay;
		this.uid = uid;
	}

	function addDelayedCallback(callback, delay, uid) {
		if (callback && delay) {
			var c = new CallbackDetails(callback, delay, uid)
			delayedCallbacks.push(c);
		}
	}

	return {
		// initalize resize event listener
		init: function(event, callback) {
			window.addEventListener(event, FiredEvent);
			addCallback(callback);
		},
		// initalize resize event listener with delay
		initWithDelay:function(event, callback, delay, uid){
			window.addEventListener(event, FiredEvent);
			addDelayedCallback(callback, delay, uid);
		},
		// public method to add additional callback
		add: function(callback) {
			addCallback(callback);
		}
	}
}());

// start process
EventHandler.init('resize', function() {
	resizeEvents();
});

EventHandler.initWithDelay('resize', function() {
	resizeDelayEvents();
},300, 'DelayReInit');

var ticking = false;

/**Callback for our scroll event - just keeps a track on the last scroll value*/
function onScroll() {
	requestTick();
}

/*** Calls rAF if it's not already been done already*/
function requestTick() {
	if(!ticking) {
		// requestAnimFrame(update);
		onceAnimationUpdate(update);
		ticking = true;
	}
}

/*** Our animation callback*/
function update() {

	scrollEvents();

	// allow further rAFs to be called
	ticking = false;
}

// only listen for scroll events
window.addEventListener('scroll', onScroll, false);

// // shim layer with setTimeout fallback
// window.requestAnimFrame = (function(){
//     return  window.requestAnimationFrame       ||
//         window.webkitRequestAnimationFrame ||
//         window.mozRequestAnimationFrame    ||
//         window.oRequestAnimationFrame      ||
//         window.msRequestAnimationFrame     ||
//         function( callback ){
//             window.setTimeout(callback, 1000 / 60);
//         };
// })();



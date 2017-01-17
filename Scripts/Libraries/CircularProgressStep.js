/////////////////////////////////////////////////////
////////////ATCOM Internet & Multimedia//////////////
/////////////////////////////////////////////////////
////////////////////@mimikos/////////////////////////
/////////////////////////////////////////////////////
////////////CircularProgressStep_v.0.2///////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////////////06 Oct 2015////////////////////////
/////////////////////////////////////////////////////

var CircularProgressStep = (function() {
    'use strict';

    function CircularProgressStep(canvas_id)
    {
        if (!(this instanceof CircularProgressStep)) {
            return new CircularProgressStep(args);
        }

        var _CircularProgressStep = this;

        var defaults = {
            dotsNum:6,
            emptyColor:"#393939",
            fillColor:"#FF592F",
            emptyStroke:3,
            fillStroke:4,
            dotRadius:3.5,
            mouseInteraction:false,
            stepCallback:null
        };

        this.canvas = canvas_id;
        this.stage = new createjs.Stage(this.canvas);
        this.canvasWidth = this.canvas.width = this.canvas.offsetWidth;
        this.canvasHeight = this.canvas.height = this.canvas.offsetWidth;
        this.themes = defaults;
        this.durationByStep = true;
        this.duration = .5;
        this.dotScaleFactor = 1.5;
        this.currentStep = 0;
        this.dotsArray = new Array();
        this.hasListeners = false;
        this.onceEnabledMouseOver = false;
    }

    CircularProgressStep.prototype.setup = function(themes)
    {
        this.erase();

        this.canvasWidth = this.canvas.width = this.canvas.offsetWidth;
        this.canvasHeight = this.canvas.height = this.canvas.offsetWidth;

        var _CircularProgressStep = this;

        for (var prop in themes) {
            if (themes.hasOwnProperty(prop)) {
                _CircularProgressStep.themes[prop] = themes[prop];
            }
        }

        (function init()
        {
            //afairw to width twn dots gia na kanoun tween xwris na kovwntai
            var circleradius = _CircularProgressStep.canvasWidth/2-((_CircularProgressStep.themes.dotRadius*3/2)*_CircularProgressStep.dotScaleFactor);
            var totalpoints = _CircularProgressStep.themes.dotsNum;
            var incrementAngle  = 360 / (totalpoints);

            var mainContainer = new createjs.Container();
            var bgCircle = new createjs.Shape();
            bgCircle.graphics.clear();
            bgCircle.graphics.setStrokeStyle(_CircularProgressStep.themes.emptyStroke, "round").beginStroke(_CircularProgressStep.themes.emptyColor).drawCircle(0, 0, circleradius).endFill();

            var frontContainer = new createjs.Container();
            _CircularProgressStep.frontCircle = new createjs.Shape();
            var g = _CircularProgressStep.frontCircle.graphics;
            _CircularProgressStep.frontCircle.angle = 0;
            _CircularProgressStep.frontCircle.radius = circleradius;
            _CircularProgressStep.frontCircle.thickness = _CircularProgressStep.themes.fillStroke;
            _CircularProgressStep.frontCircle.color = _CircularProgressStep.themes.fillColor;

            frontContainer.addChild(_CircularProgressStep.frontCircle);

            var dotsContainer = new createjs.Container();

            var theta;
            var dot;
            //rgba(hexToRgb(_CircularProgressStep.themes.fillColor, 0))
            var strokeRGBA = "rgba("+hexToRgb(_CircularProgressStep.themes.fillColor, 0)+")"
            for (var i = 0; i < totalpoints; i++) {
                theta = (Math.PI * 2 / totalpoints) * i;
                dot = new createjs.Shape();
                dot.graphics.setStrokeStyle(_CircularProgressStep.themes.dotRadius/2).beginStroke(strokeRGBA).beginFill(_CircularProgressStep.themes.emptyColor).drawCircle(0, 0, _CircularProgressStep.themes.dotRadius).endFill();
                dot.x =  Math.sin( theta ) * circleradius;
                dot.y =  Math.cos( theta ) * circleradius;
                dot.ind = i;
                dot.originalDiameter = _CircularProgressStep.themes.dotRadius * 2;
                _CircularProgressStep.dotsArray.push(dot);
                dotsContainer.addChild(dot);

                dot = null;
            }

            _CircularProgressStep.mouseEnabled(_CircularProgressStep.themes.mouseInteraction);

            frontContainer.rotation = -90;
            dotsContainer.rotation =  180;
            mainContainer.addChild(bgCircle);
            mainContainer.addChild(frontContainer);
            mainContainer.addChild(dotsContainer);
            _CircularProgressStep.stage.addChild(mainContainer);
            mainContainer.regX = -_CircularProgressStep.canvasWidth/2;
            mainContainer.regY = -_CircularProgressStep.canvasWidth/2;

            _CircularProgressStep.step(_CircularProgressStep.currentStep, true);
            _CircularProgressStep.render();

            //clear memory
            mainContainer = null;
            bgCircle = null;
            frontContainer = null;
            dotsContainer = null;
        })();
    }

    CircularProgressStep.prototype.next = function(){
        if(this.currentStep < this.dotsArray.length){
            this.step(this.currentStep+1, false)
        }
    }

    CircularProgressStep.prototype.prev = function(){
        if(this.currentStep > 0){
            this.step(this.currentStep-1, false)
        }
    }

    CircularProgressStep.prototype.step = function(num, immediate)
    {
        var _CircularProgressStep = this;
        var time;

        time = (this.durationByStep == false) ? this.duration : this.duration * (Math.abs(this.currentStep - num));
        if(immediate)time = 0;
        if(num > this.themes.dotsNum)num = this.themes.dotsNum;

        var vima = (360/this.themes.dotsNum) * num;
        TweenMax.to(_CircularProgressStep.frontCircle, time, {angle:vima, ease:Power2.easeInOut, onUpdate:animateArc, onUpdateParams:[_CircularProgressStep.frontCircle]})

        function animateArc(targ) {
            var s = targ;
            s.angle += 0;
            var endAngle = (s.angle) * Math.PI / 180;
            s.graphics.clear();
            s.graphics.setStrokeStyle(s.thickness, "round", "round").beginStroke(s.color).arc(0, 0, s.radius, 0, endAngle, false);
            _CircularProgressStep.render();
        }

        var strokeTween = {value:0};
        for (var i = 0, len = _CircularProgressStep.dotsArray.length; i < len; i++) {
            TweenMax.to(strokeTween , .5, {value:0, onUpdate:tweenStrokeColor, onUpdateParams:[_CircularProgressStep.dotsArray[i]]});
        }

        var childIndex = _CircularProgressStep.themes.dotsNum - num;
        if(childIndex != _CircularProgressStep.themes.dotsNum){
            var mc = _CircularProgressStep.dotsArray[childIndex];
            TweenMax.to(strokeTween , .5, {value:1, onUpdate:tweenStrokeColor, onUpdateParams:[mc]})
        }

        this.currentStep = num;
        this.themes.stepCallback(num);

        function tweenStrokeColor(mc){
            mc.graphics.clear();
            var strokeRGBA = "rgba("+hexToRgb(_CircularProgressStep.themes.fillColor, strokeTween.value)+")"
            mc.graphics.setStrokeStyle(_CircularProgressStep.themes.dotRadius/2).beginStroke(strokeRGBA).beginFill(_CircularProgressStep.themes.emptyColor).drawCircle(0, 0, _CircularProgressStep.themes.dotRadius).endFill();
        }
    }

    CircularProgressStep.prototype.render = function()
    {
        this.stage.update();
    }

    CircularProgressStep.prototype.reset = function()
    {
        this.step(0, true);
    }

    CircularProgressStep.prototype.mouseEnabled = function(enabled)
    {
        var _CircularProgressStep = this;

        if(enabled == true){
            if(this.onceEnabledMouseOver == false){
                this.stage.enableMouseOver(20);
                this.onceEnabledMouseOver = true;
            }
            if(this.hasListeners == true)return;
            var hoverEffect;
            for (var i = 0, len = this.dotsArray.length; i < len; i++) {
                this.dotsArray[i].addEventListener("mouseover", dotInteraction);
                this.dotsArray[i].addEventListener("click", dotInteraction);
                this.dotsArray[i].cursor = 'pointer';
                hoverEffect = new TimelineMax({paused:true, onUpdate:_CircularProgressStep.render.bind(_CircularProgressStep)})
                hoverEffect.to(this.dotsArray[i],.4,{scaleX:_CircularProgressStep.dotScaleFactor, scaleY:_CircularProgressStep.dotScaleFactor, ease:Power1.easeInOut})
                hoverEffect.to(this.dotsArray[i],.4,{scaleX:1, scaleY:1, ease:Power1.easeInOut})
                this.dotsArray[i].hoverEffect = hoverEffect;
            }
            this.hasListeners = true;
        }else{
            if(this.hasListeners == false)return;
            for (var i = 0, len = this.dotsArray.length; i < len; i++) {
                this.dotsArray[i].removeAllEventListeners();
                this.dotsArray[i].cursor = 'default';
                this.dotsArray[i].hoverEffect.clear();
                this.dotsArray[i].hoverEffect = null;
            }
            this.hasListeners = false;
        }

        function dotInteraction(e){
            switch(e.type) {
                case "mouseover":
                    //console.log(e.target.hoverEffect.progress());
                    e.target.hoverEffect.progress() != 1 ? e.target.hoverEffect.play() : e.target.hoverEffect.restart();
                    break;
                case "click":
                    e.target.hoverEffect.reverse();
                    var newstep = _CircularProgressStep.themes.dotsNum - e.target.ind;
                    if(_CircularProgressStep.currentStep == newstep)return;
                    _CircularProgressStep.step(newstep);
                    break;
            }
        }
    }

    CircularProgressStep.prototype.erase = function()
    {
        this.mouseEnabled(false);

        while (this.stage.numChildren > 0) {
            this.stage.removeChildAt(0);
        }

        this.frontCircle = null;
        for (var i = 0, len = this.dotsArray.length; i < len; i++) {
            this.dotsArray[i] = null;
        }
        this.dotsArray = [];


        TweenMax.killAll();

        this.render();
    }


    return CircularProgressStep;

}());

//helpers
function hexToRgb(hex, alpha) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
    ""+ parseInt(result[1], 16)+
    ","+ parseInt(result[2], 16)+
    ","+ parseInt(result[3], 16)+
    ","+ alpha
        : null;
}
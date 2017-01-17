var circular;
var totalInd;
var nowInd;
var wrap;
var textTween;

(function () {
    var canvasElem = document.getElementById("circularProgressStepCanvas");
    totalInd = document.getElementById("tInd");
    nowInd = document.getElementById("nInd");
    wrap = document.getElementById("progressWrapper");
    var paging = document.getElementById("paging");
    textTween = {value:0};

    window.addEventListener("resize", resizeHandler);

    var Controls = function() {
        this.mouseEnabled =  false;
        this.steps = 6;
        this.emptyColor = "#ffffff";
        this.fillColor = "#987f5f";
        this.emptyStroke = 1;
        this.fillStroke = 2;
        this.dotRadius = 2;
        this.reset = function(){
            circular.reset();
        }
    };

    var settings = new Controls();
    var themes = {dotsNum:settings.steps, dotRadius:settings.dotRadius, mouseInteraction:settings.mouseEnabled, stepCallback:onStep, emptyColor:settings.emptyColor, fillColor:settings.fillColor, emptyStroke:settings.emptyStroke, fillStroke:settings.fillStroke, dotRadius:settings.dotRadius};

    circular = new CircularProgressStep(canvasElem);
    circular.setup(themes);
}());

function onStep(step){
    //tween indicator value
    var time = circular.duration * (Math.abs(textTween.value - step));
    TweenMax.to(textTween, time, {value:step, ease:Power2.easeInOut, onUpdate:function(){
        nowInd.innerText = nowInd.textContent = parseInt(textTween.value) + "";
    }})
}

var prevWidth = 0;
function resizeHandler(){
    if(wrap.offsetWidth != prevWidth){
        //empty to change nothing
        circular.setup();
    }
    prevWidth = wrap.offsetWidth;
}


function goNext(e){
    circular.next();
}

function goPrev(e){
    circular.prev();
}
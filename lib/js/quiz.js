/**
* Clock:
* Copyright (c) 2013 Carlos Cabañero (c.cabanerochaparro@gmail.com) and contributors

* Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 **/

function Clock(params) {
    var doStep = {};
    var doDraw = {};
    var type, initValue, data, time, showText, textColor, bodyColor, borderColor, bodyWidth, borderWidth, bodySeparation, fontFace, endCallback, dateStart, freq, netRadius, autoDraw, clockInterval, drawInterval;
    
    this.params = params;

    function setInitialClock(clock){
    	
        type = clock.params.type || Clock.TYPE_CLOCKWISE_INCREMENT;
        initValue = clock.params.initValue || (type <= Clock.TYPE_CLOCKWISE_DECREMENT) ? 0 : 2;
        data = initValue;
        time = parseInt((clock.params.time) ? (clock.params.time) : 60);
        showText = (clock.params.showText != null) ? (clock.params.showText) : true;
        textColor = (showText) ? (clock.params.textColor || 'white') : null;
        bodyColor = (clock.params.bodyColor) ? clock.params.bodyColor : '#FF0000';
        borderColor = (clock.params.borderColor) ? clock.params.borderColor : 'transparent';
        bodyWidth = clock.params.bodyWidth || 10;
        borderWidth = clock.params.borderWidth || bodyWidth;
        bodySeparation = (clock.params.bodySeparation) ? (clock.params.bodySeparation) : 0;
        fontFace = (clock.params.fontFace) ? clock.params.fontFace : "'Roboto Condensed', sans-serif";
        endCallback = clock.params.endCallBack || function() {
            //console.log('TIME OUT!!');
        };
        dateStart = new Date();
        freq = (clock.params.freq != null) ? clock.params.freq : 10;
        netRadius = Math.max(bodyWidth, borderWidth);
        autoDraw = (clock.params.autoDraw != null) ? clock.params.autoDraw : true;
        clock.diff = 0;

        //PUBLIC:
        clock.ctx = clock.params.context;
        clock.x = clock.params.x || 100,
        clock.y = clock.params.y || 100,
        clock.radius = clock.params.radius || 100;
    }

    this.init = function(){
        setInitialClock(this);
    }

    //Draw Funcs
    doStep[Clock.TYPE_CLOCKWISE_INCREMENT] = function(Clock) {
        if (data >= 2) {
            clearInterval(clockInterval);
            clearInterval(drawInterval); 
            data = 2;
            endCallback();
            return;
        }
        var now = new Date();
        Clock.diff = ((now.getTime() - dateStart.getTime()) / 1000);
        data = Clock.diff * 2 / Clock.time;
    };

    doDraw[Clock.TYPE_CLOCKWISE_INCREMENT] = function(Clock) {
        eraseZone(Clock);
        drawBorder(Clock);
        Clock.ctx.beginPath();
        Clock.ctx.strokeStyle = bodyColor;
        Clock.ctx.lineWidth = bodyWidth;
        var quart = Math.PI / 2;
        Clock.ctx.arc(Clock.x, Clock.y, Clock.radius, initValue * Math.PI - quart, data * Math.PI - quart, false);
        Clock.ctx.stroke();
        drawText(Clock);
    };
    
    doStep[Clock.TYPE_COUNTERCLOCKWISE_INCREMENT] = function(Clock) {
        if (data <= 0) {
            clearInterval(clockInterval);
            clearInterval(drawInterval);
            data = 2;
            endCallback();
            return;
        }

        var now = new Date();
        Clock.diff = ((now.getTime() - dateStart.getTime()) / 1000);
        data = 2 - Clock.diff * 2 / Clock.time;
    };

    doDraw[Clock.TYPE_COUNTERCLOCKWISE_INCREMENT] = function(Clock) {
        eraseZone(Clock);
        drawBorder(Clock);
        Clock.ctx.beginPath();
        Clock.ctx.strokeStyle = bodyColor;
        Clock.ctx.lineWidth = bodyWidth;
        Clock.ctx.arc(Clock.x, Clock.y, Clock.radius, data * Math.PI, 0 * Math.PI, false);
        Clock.ctx.stroke();
        drawText(Clock);
    };

    function drawBorder(Clock) {
        Clock.ctx.beginPath();
        Clock.ctx.strokeStyle = borderColor;
        Clock.ctx.lineWidth = borderWidth;
        Clock.ctx.arc(Clock.x, Clock.y, Clock.radius + bodySeparation, 0 * Math.PI, 2 * Math.PI, false);
        Clock.ctx.stroke();
    }
    function drawText(Clock) {
        if (!showText) {
            return;
        }
        Clock.ctx.fillStyle = textColor;
        Clock.ctx.font = "bold " + (Clock.radius / 1.2) + "px " + fontFace;
        Clock.ctx.textAlign = 'center';
        Clock.ctx.fillText(Math.ceil(Clock.time - Clock.diff), Clock.x, Clock.y + (Clock.radius / 4));
        Clock.ctx.restore();
    }
    function eraseZone(Clock) {
        Clock.ctx.clearRect(Clock.x - Clock.radius - netRadius, Clock.y - Clock.radius - netRadius, Clock.radius * 2 + netRadius * 2, Clock.radius * 2 + netRadius * 2);
    }

    this.step = function() {
        clockInterval = setInterval(function(Clock) {
            doStep[type](Clock);
        }, freq, this);

        if (autoDraw) {
            drawInterval = setInterval(function(Clock) {
                Clock.draw();
            }, freq, this);
        }
    };

    this.draw = function() {
        this.ctx.save();
        doDraw[type](this);
        this.ctx.restore();
    };

    this.setEndCallBack = function(newCallBack) {
        endCallback = newCallBack;
    };

     //clear the interval
    this.stopEndCallBack = function(){
        clearInterval(clockInterval);
        clearInterval(drawInterval);
    }; 

    this.reset = function(params){
        var keys= Object.keys(this.params);
        var keys2= Object.keys(params);
        for(var i = 0; i < keys.length; i++){
            for (var j = 0; j < keys2.length; j++) {
                if(keys2[j] == keys[i]){
                    this.params[keys[i]] = params[keys2[j]]
                    break
                }
            };
        }

        setInitialClock(this);
    }
}
Clock.TYPE_CLOCKWISE_INCREMENT = 0;
Clock.TYPE_CLOCKWISE_DECREMENT = 1;
Clock.TYPE_COUNTERCLOCKWISE_INCREMENT = 2;
Clock.TYPE_COUNTERCLOCKWISE_DECREMENT = 3;
Clock.prototype.getGameTime = function() {
    return Math.ceil(this.diff);
};


/**
 * @preserve
 * QUIZ
 * VERSION: 2.1
 * JS
 * AUTHOR: Ian Duff
 * COPYRIGHT: Essemble Ltd
 * All code © 2015 Essemble Ltd. all rights reserved
 * This code is the property of Essemble Ltd and cannot be copied, reused or modified without prior permission
 */

function Quiz (vars) {
	//constructor
	var scope = this;
	this._screen = vars.element._screen;
	this._container = vars.element._container;
	this._questionContainer;	
	this._timeoutContainer;
	this._oTimeoutElements = {};
	this._scoreContainer;
	this._arScoreElements = [];
	this._timer = false;

	//the question container will hold everything 
	this._questionContainer = create({ type: "div", id: "questionContainer" });
	this._container.appendChild(this._questionContainer);

	//option container will contain the question options, buttons and any supporting elements
	var optionContainer = create({ type: "div", id: "optionContainer" }); 
	$(optionContainer).css("left",0);  
	$(optionContainer).css("top",0); 
	this._questionContainer.appendChild(optionContainer);
	
	//feedback container
	var fbContainer = create({ type: "div", id: "feedbackContainer" }); 
	this._questionContainer.appendChild(fbContainer);

	//create the timeout elements
	this._timeoutContainer = create({ type: "div", id: "timeoutContainer" }); //timeout container 
	$(this._timeoutContainer).hide();
	this._screen.container().appendChild(this._timeoutContainer);

	//create the score screen feedbacks (pass,fail);
	this._scoreContainer = create({ type: "div", id: "scoreContainer" });; //score container
	$(this._scoreContainer).hide();
	this._screen._container.appendChild(this._scoreContainer);

	MCQ.call(this,vars); //inherit the MCQ object

	var timeout = $(this._xml).find("timeout");
	var oTimeOut = {};
	oTimeOut._xml = timeout;
	oTimeOut._elements = [];
	$(timeout).children().each(function(){
		var el = new Element({screen:scope._screen, xml:this});
		el._target = scope._timeoutContainer;
		oTimeOut._elements.push(el)
	});

	this._oTimeoutElements = oTimeOut;
	
	var score = $(this._xml).find("score");
	this._masteryscore = score.attr("masteryscore") || 80;

	$(score).find("fb").each(function(){
		var fbObj = {};
		fbObj._id = $(this).attr("id");
		fbObj._xml = score;
		fbObj._elements = [];
		fbObj._event = null;
		if($(this).attr("event")) fbObj._event = $(this).attr("event");

		$(this).children().each(function(){
			var elem = new Element({screen:scope._screen, xml:this});
			elem._target = scope._scoreContainer;
			fbObj._elements.push(elem);
		})
		
		scope._arScoreElements.push(fbObj);
	});

	//attach the timer if appropriate
	var settings = $(this._xml).find("settings");
	if(settings.attr("timer")) { this._timer = Boolean(settings.attr("timer").toLowerCase() === "true"); }
	var timerx = settings.attr("timerx") || 0;
	var timery = settings.attr("timery") || 0;

	//the timer canvas 
	var clockCanvas = create({ type: "canvas", id: "timer" });
	$(clockCanvas).css("position","absolute");
	$(clockCanvas).css("left",timerx +"px");
	$(clockCanvas).css("top",timery+"px");
	$(clockCanvas).attr("width",300);
	$(clockCanvas).attr("height",300);
	this._clockCanvas = clockCanvas;

	var cont = clockCanvas.getContext("2d");

	//change colours, width and radius here
	if(this._timer){
		this._timer = new Clock({ 
			context 	: cont, 
		  	type 		: Clock.TYPE_CLOCKWISE_INCREMENT,
		  	time 		: scope.curQ()._time,
		  	showText 	: true,
		  	textColor 	: '#439FE0',
		  	bodyColor   : '#56B68B',
		  	borderColor : '#525e6c',
		  	radius 	    : 100,
		  	bodyWidth   : 20,
		  	borderWidth : 50,
		  	autoDraw:true,
		  	x:150,
		  	y:150,
		  	endCallBack : scope.timeout.bind(scope)
		});
	}
}

Quiz.prototype = {
	//Quiz methods

	makeQuestionObj:function(xml){
		//override the MCQ class as we don't want to load the question immediately
		//this is done on begin()
		//for each question create a question object
		//the object has an element array, option array and feedback array,
		//question properties,
		//question container,
		//option container,
		//feedback container,
		//methods to return the current question elements, options and feedbacks by id.
		
		var qObj = {};
		qObj._id = xml.attr("id")  || "question" + this._arQs.length+1;
		qObj._time = parseInt(xml.attr("time")) || 0;
		qObj._xml = xml;
		qObj._arElements = []; //stores all the option elements and supporting elements for this question
		qObj._arOptions = []; //stores all option objects (a property of which is the option element) for this question
		qObj._arFbs = []; //stores feedback objects for this question (pass, partial, fail)
		qObj._radioMode = true;
		qObj._bPassed = false;
		qObj._event = null;
		if(xml.attr("event")) qObj._event = xml.attr("event");

		//option container will contain the question options, buttons and any supporting elements
		qObj._optionContainer = get("optionContainer") //create({ type: "div", id: "optionContainer" }); 
		
		//feedback container
		qObj._fbContainer = get("feedbackContainer") //create({ type: "div", id: "feedbackContainer" }); 
		
		qObj.getElementById = function(id){
			var ret = null;
			for (var i=0;i<this._arElements.length;i++){
				if(this._arElements[i]._id == id){
					ret = this._arElements[i];
					break;
				}
			}
			return ret;
		}
		qObj.getOptionById = function(id){
			var ret = null;
			for (var i=0;i<this._arOptions.length;i++){
				if(this._arOptions[i]._id == id){
					ret = this._arOptions[i];
					break;
				}
			}
			return ret;
		}
		qObj.getFeedbackById = function(id){
			var ret = null;
			for (var i=0;i<this._arFbs.length;i++){
				if(this._arFbs[i]._id == id){
					ret = this._arFbs[i];
					break;
				}
			}
			return ret;
		}
		
		//for each question create 3 arrays:
		//qObj._arElements (contains options and supporting elements, including confirm and reset buttons)
		//qObj._arOptions (contains option objects)
		//qObj._arFbs (contains feedback objects)

		var correctCount = 0;
		var question = xml.children();//all the nodes in the question node
		var scope = this;
		$(xml).children().each(function(){
			var nodeType = this.tagName;
			switch(nodeType){
				case "option":
					var firstElement = $(this).children()[0];
					var oOptionElement = new Element({screen:scope._screen, xml:firstElement});
					oOptionElement._target = qObj._optionContainer;
					qObj._arElements.push(oOptionElement);
					
					//create an option object 
					//this so we can loop thru just the options in each question
					//properties include: correct, selected, element, (specific) feedback
					//push to the qObj._arOptions array
					var qOptionObj = {};
					qOptionObj._id = oOptionElement._id;
					qOptionObj._element = oOptionElement;
					qOptionObj._correct = Boolean($(this).attr("correct").toLowerCase() == "true");
					qOptionObj._selected = false;
					qOptionObj._feedback = null;
	
					//radio mode is when there is only one correct answer
					//in radio mode only one option can be selected at a time
					if(qOptionObj._correct) correctCount++;
					if(correctCount > 1 || scope._forceMany) qObj._radioMode = false;
					qObj._arOptions.push(qOptionObj);
				break;
				
				case "fb":
					//create a feedback object
					//properties are id (either option id or "pass","partial","fail")
					//and an array of elements
					//push to the qObj._arFbs array
					
					var fbObj = {};
					fbObj._id = $(this).attr("id");
					fbObj._xml = $(this).children();
					fbObj._elements = [];
					fbObj._event = null;
					if($(this).attr("event")) fbObj._event = $(this).attr("event");
					
					$(this).children().each(function(){
						var el = new Element({screen:scope._screen, xml:this });
						fbObj._elements.push(el);
					})
					
					qObj._arFbs.push(fbObj);
			
				break;
				
				default:
					//all other elements, e.g. buttons (confirm & reset), additional text, images, audio, video
					var otherEl = new Element({screen:scope._screen, xml:this });
					otherEl._target = qObj._optionContainer;
					qObj._arElements.push(otherEl);
				break;
			}
		});

		scope._arQs.push(qObj);
	},
	
	init:function(){
		//override mcq init function
		//the first question is loaded by begin()
		if(get("timerContainer")){
			get("timerContainer").appendChild(this._clockCanvas);
		} else {
			this._screen._container.appendChild(this._clockCanvas);
		}
	},
	
	begin:function(element){
		this._iCurQ = 0;
		this.loadQuestion(this._iCurQ);
	},
	
	loadQuestion:function(id){
		var q = this._arQs[id];
		if(q._event) this._screen.doClickEventById(q._event);

		//reset any selected options
		for (var i=0;i<q._arOptions.length;i++) {
			q._arOptions[i]._selected = false;
		}

		//target the questions option container
		for (var i=0;i<q._arElements.length;i++){
			q._arElements[i]._target = get("optionContainer");
		}

		//load the options and supporting elements within the questions option container
		//start the timer when batch load is complete
		var optionLoader = new ElementLoader({screen:this._screen, elements:q._arElements, onAnimsComplete:"startTimer", onCompleteScope:this});
		optionLoader.load();
	},

	loadNextQuestion:function(element){
		this.clearQuestionContainer();
		this.clearTimeoutContainer();
		
		if(this._iCurQ < this._arQs.length-1) {
			this._iCurQ++; 
			this.loadQuestion(this._iCurQ);
		} else {
			this.showScore();
		}
	},

	loadPreviousQuestion:function(element){
		this.clearQuestionContainer();
		this.clearTimeoutContainer();
		
		if(this._iCurQ != 0) {
			this._iCurQ--; 
			this.loadQuestion(this._iCurQ);
		}
	},

	submit:function(element){
		var q = this._arQs[this._iCurQ];
		q._bPassed = false;
		var optionCorrectCount = 0;
		var userCorrectCount = 0;
		var allCorrect = false;
		var selectedOptionPos = null; //remember the (last) selected option in case of specific feedback
		var count = 0;
		var bPartial = false;

		//stop & hide the timer
		if(this._timer){ 
			this.stopTimer(); 
			$(get("timer")).fadeOut(500);
		}

		//disable confirm, enable reset
		var confirmBtn = q.getElementById("submitBtn");
		if(confirmBtn) confirmBtn.disableBtn();
		
		var resetBtn = q.getElementById("resetBtn");
		if(resetBtn) resetBtn.enableBtn();
		
		//disable options and work out which ones answered correctly
		for (var i=0;i<q._arOptions.length;i++) {
			q._arOptions[i]._element.disable();
			if(q._arOptions[i]._correct) { optionCorrectCount++; };
			if(q._arOptions[i]._selected && q._arOptions[i]._correct) { userCorrectCount++; bPartial = true; };
			if(q._arOptions[i]._selected && !q._arOptions[i]._correct) userCorrectCount--;
			if(q._arOptions[i]._selected) {
				selectedOptionPos = (count+1);
			}
			count++;
		}
		
		//does the selected option have specific feedback? (returns null if not)
		var spFb = q.getFeedbackById(selectedOptionPos);

		if(userCorrectCount == optionCorrectCount){
			//all correct
			spFb ? this._fb = spFb : this._fb = q.getFeedbackById("pass");
			q._bPassed = true;	//flag question as passed
		} else if (bPartial){
			//some correct
			spFb ? this._fb = spFb : this._fb = q.getFeedbackById("partial");
		} else {
			//none correct
			spFb ? this._fb = spFb : this._fb = q.getFeedbackById("fail");
		}

		//target the feedback container
		for (var i=0;i<this._fb._elements.length;i++) {
			this._fb._elements[i]._target = q._fbContainer;
		}
		
		//send a copy of the feedback array to the element loader
		//this is so that if the loader array length is increased by box nested elements
		//the copied array is updated not the orginal array
		var fbCopy = [];
		fbCopy = this._fb._elements.slice();
		
		//load the feedback elements
		var fbLoader = new ElementLoader({screen:this._screen, elements:fbCopy, onAnimsComplete:"scrollToBottom", onCompleteScope:this});
		fbLoader.load();
		
		//fire any events defined for the feedback
		if(this._fb._event) {
			var str = this._fb._event.split(" ").join("").toString();
			var arSplit = str.split(",")
			for(var i=0;i<arSplit.length;i++){
				this._screen.doClickEventById(arSplit[i],null);
			}
		}
	},

	scrollToBottom:function(){
		$('html, body').animate({ 
		   scrollTop: $(document).height()-$(window).height()}, 
		   1000, 
		   "easeOutQuint"
		);
	},
	
	timeout:function(){
		//empty current question
		this.clearQuestionContainer();
		
		//stop & hide timer
		if(this._timer){ 
			this.stopTimer();
			$(get("timer")).hide();
		}

		//send a copy of the feedback array to the element loader
		//this is so that if the loader array length is increased by box nested elements
		//the copied array is updated not the orginal array
		var elCopy = [];
		elCopy = this._oTimeoutElements._elements.slice();

		//load the timeout elements
		var elementLoader = new ElementLoader({screen:this._screen, elements:elCopy});
		elementLoader.load();
		
		//fire any events that may be tied to the feedback
		if(xmlAttrStr(this._oTimeoutElements._xml,"event")) {
			this._screen.doClickEventById(this._oTimeoutElements._xml.attr("event"), null);
		}
		$(this._timeoutContainer).show();
	},

	getScore:function(asPercentage){
		var score = 0;
		for(var i=0;i<this._arQs.length;i++){
			if(this._arQs[i]._bPassed) score++;
		}
		var perc = Math.round((score/this._arQs.length) *100);
		if(asPercentage){
			return perc;
		} else {
			return score;
		}
	},
	
	showScore:function(){
		//work out the score
		var userPercentage = this.getScore(true);
		var oScoreFb = {};

		//get the appropriate feedback
		if(userPercentage >= this._masteryscore) {
			oScoreFb = this.getScoreFeedbackById("pass");
		} else {
			oScoreFb = this.getScoreFeedbackById("fail");
		}

		//hide the timer
		if(this._timer){
			$(get("timer")).fadeOut(500);
		}
		
		//load feedback elements into an array
		//replace the [score] reserved word 
		var arScoreElements = [];	
		var scope = this;	
		$(oScoreFb._elements).each(function () {
			var copyNode = this._xml[0].cloneNode(true);
			scope.replaceXML(copyNode,userPercentage);//recursively checks for box nested elements
			var element = new Element({screen:scope._screen, xml:copyNode});
			element._target = scope._scoreContainer;
			arScoreElements.push(element);
		})
		
		//send a copy of the feedback array to the element loader
		//this is so that if the loader array length is increased by box nested elements
		//the copied array is updated not the orginal array
		var fbCopy = [];
		fbCopy = arScoreElements.slice();
		arScoreElements = [];

		//load the score elements
		var elementLoader = new ElementLoader({screen:this._screen, elements:fbCopy});
		elementLoader.load();
		
		//fire any events that may be tied to the feedback
		if(oScoreFb._event){
			this._screen.doClickEventById(oScoreFb._event, null);
		}
		$(this._scoreContainer).show();
	},

	replaceXML:function(copyNode,userPercentage){
		if($(copyNode).children().length > 0){
			for(var i=0;i<$(copyNode).children().length; i++){
				var nestedXML = $(copyNode).children()[i];
				this.replaceXML(nestedXML,userPercentage)
			}
		} else {
			//replaces the value of the original xml node
			var xmlNode = replaceXMLStr(copyNode,"[score]",userPercentage); 
			var xmlNode = replaceXMLStr(copyNode,"[passed]",this.getScore(false));
			var xmlNode = replaceXMLStr(copyNode,"[total]",this._arQs.length);  
		}
	},

	select:function(element){
		//select an option
		var q = this.curQ();
		var selectedOption = q.getOptionById(element._id);
		
		if(q._radioMode){
			element.disable();
			for (var i=0; i<q._arOptions.length;i++){
				if(q._arOptions[i]._element != element){
					q._arOptions[i]._element.enable();
					q._arOptions[i]._selected = false;
				} 
			}
			selectedOption._selected = true;
		} else {
			if(selectedOption._selected){
				//deselect
				selectedOption._selected = false;
				element.enable();
				element.rollout();
				$(element._container).on('mouseenter', element.mouseOverHandler.bind(element));
				$(element._container).on('mouseleave', element.mouseOutHandler.bind(element));
			} else {
				//select
				//disable rollover events
				selectedOption._selected = true;
				$(element._container).off('mouseenter');
				$(element._container).off('mouseleave');
			}
		}

		//if any of the options have been selected, enable the confirm btn, otherwise disable it
		var bEnable = false;
		for (var i=0; i<q._arOptions.length;i++) {
			if(q._arOptions[i]._selected) bEnable = true;
		}
		
		var confirmBtn = q.getElementById("submitBtn");
		if(!confirmBtn) confirmBtn = this._screen.getElementById("submitBtn");

		if(confirmBtn){
			bEnable ? confirmBtn.enableBtn() : confirmBtn.disableBtn();
		}
	},
	
	restart:function(element){
		this.clearTimeoutContainer();
		this.clearScoreContainer();
		this.clearQuestionContainer();
		this._iCurQ = 0;
		this.loadQuestion(this._iCurQ);
	},
	
	startTimer:function(){
		if(this._timer){
			$(get("timer")).show();
			this._timer.init();
			var qTime = this._arQs[this._iCurQ]._time;
			this._timer.time = qTime;
			this._timer.step();//start the timer
		}
	},
	
	stopTimer:function(){
		if(this._timer){
			this._timer.stopEndCallBack();
			//$(get("timer")).remove();
		}
	},

	clearTimeoutContainer:function(){
		this._timeoutContainer.innerHTML = "";
		$(this._timeoutContainer).css("display","none");
	},
	
	clearScoreContainer:function(){
		this._scoreContainer.innerHTML = "";
		$(this._scoreContainer).css("display","none");
	},
	
	getScoreFeedbackById:function(id){
		for (var i=0;i<this._arScoreElements.length;i++){
			if(this._arScoreElements[i]._id == id){
				return this._arScoreElements[i];
				break;
			}
		}
	}
} //end prototype object

extend(MCQ, Quiz); //inherit the MCQ object and its prototype methods	
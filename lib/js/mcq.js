/**
 * MCQ
 * VERSION: 2.0
 * JS
 * AUTHOR: Ian Duff
 * COPYRIGHT: Essemble Ltd
 * All code © 2015 Essemble Ltd. all rights reserved
 * This code is the property of Essemble Ltd and cannot be copied, reused or modified without prior permission
 **/

function MCQ(vars) {
	//constructor
	//note: quiz extends this class
		
	this._screen = vars.element._screen;
	this._element = vars.element;
	this._container = vars.element._container;
	this._xml = vars.element._xml;
	
	this._arQs = [];//question array
	this._iCurQ = 0;//current question
	this._radioBtn = false;//attach a radio button to each option
	this._radioBtnX = 0;
	this._radioBtnY = 0;
	this._correctX = 0;
	this._correctY = 0;
	this._fb = null;
	
	this._maxAttempts = null;
	this._numAttempts = 0;
	this._forceMany = false;//multiple selections can be forced in the xml settings
	
	//read the settings
	//<settings radiobutton="true" radiobuttonx="10" radiobuttony="10" correctx="-20" correcty="8"/>
	var settings = this._xml.find("settings");
	if(settings.length > 0){
		if(xmlAttrStr(settings,"radiobutton")) this._radioBtn = Boolean(settings.attr("radiobutton").toLowerCase() == "true");
		if(xmlAttrNum(settings,"radiobuttonx")) this._radioBtnX = parseInt(settings.attr("radiobuttonx"));
		if(xmlAttrNum(settings,"radiobuttony")) this._radioBtnY = parseInt(settings.attr("radiobuttony"));
		if(xmlAttrNum(settings,"correctx")) this._correctX = parseInt(settings.attr("correctx"));
		if(xmlAttrNum(settings,"correcty")) this._correctY = parseInt(settings.attr("correcty"));
		if(xmlAttrNum(settings,"attempts")) this._maxAttempts = parseInt(settings.attr("attempts"));
		if(xmlAttrStr(settings,"manyfrommany")) this._forceMany = Boolean(settings.attr("manyfrommany").toLowerCase() == "true");
	}
	
	var scope = this;
	$(this._xml).find('question').each(function () {
		scope.makeQuestionObj($(this))
    });
}

MCQ.prototype = {
	//MCQ methods
	
	makeQuestionObj:function(xml){
		//for each question create a question object
		//the object has an element array, option array and feedback array
		//question properties
		//question container
		//option container
		//feedback container
		//methods to return the current question elements, options and feedbacks by id
		var qObj = {};
		qObj._id = xml.attr("id")  || "question" + this._arQs.length+1;
		qObj._time = xml.attr("time") || 0;
		qObj._xml = xml;
		qObj._arElements = []; //stores all the option elements and supporting elements for this question
		qObj._arOptions = []; //stores all option objects (a property of which is the option element) for this question
		qObj._arFbs = []; //stores feedback objects for this question (pass, partial, fail)
		qObj._radioMode = true;
		qObj._bPassed = false;
		qObj._event = null;
		if(xml.attr("event")) qObj._event = xml.attr("event");
		
		//the question container will hold everything 
		qObj._qContainer = create({ type: "div", id: "questionContainer" });
		this._container.appendChild(qObj._qContainer);
		
		//option container will contain the question options, buttons and any supporting elements
		qObj._optionContainer = create({ type: "div", id: "optionContainer" }); 
		$(qObj._optionContainer).css("left",0);  
		$(qObj._optionContainer).css("top",0); 
		qObj._qContainer.appendChild(qObj._optionContainer);

		//feedback container
		qObj._fbContainer = create({ type: "div", id: "feedbackContainer" }); 
		$(qObj._fbContainer).css("left",0); 
		$(qObj._fbContainer).css("top",0); 
		qObj._qContainer.appendChild(qObj._fbContainer); 
		
		
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
			for (var i=0;i< this._arFbs.length;i++){
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
		var scope = this;
		$(xml).children().each(function(){
			var nodeType = this.tagName;
			switch(nodeType){
				case "option":
					var firstElement = $(this).children()[0];
					var oOptionElement = new Element({screen:scope._screen, xml:firstElement});
					oOptionElement._target = qObj._optionContainer;
					scope._screen.getElementLoaderArray().push(oOptionElement);//add them to the screen element array
					qObj._arElements.push(oOptionElement);//also add them to the object._arElements array for local control
					
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
					scope._screen.getElementLoaderArray().push(otherEl);//add them to the screen element array
					qObj._arElements.push(otherEl);//also add them to the object._arElements array for local control
				break;
			}
			
			scope._arQs.push(qObj);
		});
	},
	
	init:function(){
		//init called from the ElementLoader 
		//when all elements in the batch have loaded and animated
		this.loadQuestion(this._iCurQ);
	},
	
	loadQuestion:function(id){
		var q = this.curQ();
		if(q._event) this._screen.doClickEventById(q._event);
	},
	
	select:function(element){
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
	
	submit:function(element){
		var q = this.curQ();
		var optionCorrectCount = 0;
		var userCorrectCount = 0;
		var allCorrect = false;
		//var fb = null;
		var selectedOptionPos = null; //remember the (last) selected option in case of specific feedback
		var count = 0;
		var bPartial = false;
		
		//disable confirm, enable reset
		var confirmBtn = q.getElementById("submitBtn");
		if(!confirmBtn) confirmBtn = this._screen.getElementById("submitBtn");
		if(confirmBtn) confirmBtn.disableBtn();
		
		var resetBtn = q.getElementById("resetBtn");
		if(!resetBtn) resetBtn = this._screen.getElementById("resetBtn");
		if(resetBtn) resetBtn.enableBtn();
		
		//disable options and work out which ones answered correctly
		for (var i=0;i<q._arOptions.length;i++) {
			q._arOptions[i]._element.disable();
			if(q._arOptions[i]._correct) { optionCorrectCount++; };
			if(q._arOptions[i]._selected && q._arOptions[i]._correct) { userCorrectCount++; bPartial = true;  };
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
		
		this.showCorrectAnswers();
		this._numAttempts++;
		
		//enable sca if appropriate
		if(userCorrectCount != optionCorrectCount){
			var scaBtn = q.getElementById("scaBtn");
			if(scaBtn){ 
				if(this._maxAttempts){						
					if(this._numAttempts >= this._maxAttempts){
						scaBtn.enableBtn(); 
					}
				} 
			}
		}
		
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
	
	showCorrectAnswers:function(){
		var q = this.curQ();
		for (var i=0;i<q._arOptions.length;i++) {
			if(q._arOptions[i]._correct && q._arOptions[i]._selected){
				var correct = create({type:"img", id:"correct"+(i+1), imgSrc:"lib/assets/tick_small.png", className:"tick"});
				var l = $(q._arOptions[i]._element._container).position().left + this._correctX;
				var t = $(q._arOptions[i]._element._container).position().top + this._correctY;
				//var l = this._correctX;
				//var t = this._correctY;
				$(correct).css("position","absolute");
				$(correct).css("left",l);
				$(correct).css("top",t);
				q._optionContainer.appendChild(correct);
				//q._arOptions[i]._element._container.appendChild(correct);
				console.log("ballbags"+ t)
			}
		}
	},
	
	showAllCorrectAnswers:function(){
		var q = this.curQ();
		for (var i=0;i<q._arOptions.length;i++) {
			if(q._arOptions[i]._correct){
				var correct = $(q._optionContainer).find(".tick");
				if(correct.length == 0) {
					var correct = create({type:"img", id:"correct"+(i+1) , imgSrc:"lib/assets/tick_small.png", className:"tick"});
					var l = $(q._arOptions[i]._element._container).position().left + this._correctX;
					var t = $(q._arOptions[i]._element._container).position().top + this._correctY;
					//var l = this._correctX;
					//var t = this._correctY;
					$(correct).css("position","absolute");
					$(correct).css("left",l);
					$(correct).css("top",t);
					q._optionContainer.appendChild(correct);
					//q._arOptions[i]._element._container.appendChild(correct);
				}
			}
		}
	},
	
	reset:function(element){
		var q = this.curQ();
		var confirmBtn = q.getElementById("submitBtn");
		if(!confirmBtn) confirmBtn = this._screen.getElementById("submitBtn");
		if(confirmBtn){
			confirmBtn.disableBtn();
			confirmBtn.rollout();
		}
		var resetBtn = q.getElementById("resetBtn");
		if(!resetBtn) resetBtn = this._screen.getElementById("resetBtn");
		if(resetBtn){
			resetBtn.disableBtn();
			resetBtn.rollout();
		}
		var scaBtn = q.getElementById("scaBtn");
		if(!scaBtn) scaBtn = this._screen.getElementById("scaBtn");
		if(scaBtn){ 
			scaBtn.hide();
			scaBtn.rollout(); 
		}
		
		//re-set the options
		for (var i=0;i<q._arOptions.length;i++) {
			q._arOptions[i]._selected = false;
			q._arOptions[i]._element.enable();
			
			//remove any ticks
			var correct = $(q._optionContainer).find(".tick");
			if(correct.length > 0) $(correct).remove();
		}
		
		//unload the feedback elements
		this.clearFeedbackContainer();
	},
	
	sca:function(vars){
		var q = this.curQ();
		var scaBtn = q.getElementById("scaBtn");
		if(scaBtn){ scaBtn.disableBtn(); }
		var fb = q.getFeedbackById("generic");
		if(fb){
			//unload the feedback elements
			this.clearFeedbackContainer();
			
			//target the feedback container
			for (var i=0;i<fb._elements.length;i++) {
				fb._elements[i]._target = q._fbContainer;
			}
		
			//send a copy of the feedback array to the element loader
			//this is so that if the loader array length is increased by box nested elements
			//the copied array is updated not the orginal array
			var fbCopy = [];
			fbCopy = fb._elements.slice();
			
			//load the feedback elements
			var fbLoader = new ElementLoader({screen:this._screen, elements:fbCopy});
			fbLoader.load();
			this.showAllCorrectAnswers();
			this._fb = fb;
		}
	},
	
	curQ:function(){
		return this._arQs[this._iCurQ];
	},
	
	clearQuestionContainer:function(){
		this.clearOptionContainer();
		this.clearFeedbackContainer();
	},
	
	clearOptionContainer:function(){
		this.curQ()._optionContainer.innerHTML = "";
	},
	
	clearFeedbackContainer:function(){
		if(this._fb){
			for(var i=0;i<this._fb._elements.length;i++){
				$(this._fb._elements[i]._container).remove();
			}
		}
	}
	
} //end prototype object

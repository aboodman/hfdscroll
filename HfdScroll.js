var _curHfd = null;

// targeting: ie5 mac, ns6.01, ns6.1, moz .92, ie5+ pc
function HfdScroll_create(sName) 
{
	if (!document.all && !document.getElementById)
		return null;
	else
	{
		var obj				= document.getElementById(sName);
		obj.scrollerHeight	= parseInt(obj.style.height);
		obj.resolution		= 10;	// in milleseconds
		obj.friction		= .005;	// in px/ms/ms
		obj.accel			= .0001;// in px/ms/ms
		obj.velocity		= 0;	// in px/ms
		obj.startVelocity	= 0.05;
		obj.maxVelocity		= 1.75;
		obj.absVelocity		= 0;
		obj.timerId			= 0;
		obj.lastTime		= 0;
		obj.current			= this;

		obj.getMembers		= HfdScroll_getMembers;
		obj.dragThumb		= HfdScroll_dragThumb;
		obj.gotoThumbPos	= HfdScroll_gotoThumbPos;
		obj.startTrackPos	= HfdScroll_startTrackPos;
		obj.stopTrackPos	= HfdScroll_stopTrackPos;
		obj.trackPos		= HfdScroll_trackPos;
		obj.startGlide		= HfdScroll_startGlide;
		obj.glide			= HfdScroll_glide;
		obj.extendUp		= HfdScroll_extendUp;
		obj.extendDn		= HfdScroll_extendDn;
		obj.startCinchUp	= HfdScroll_startCinchUp;
		obj.startCinchDn	= HfdScroll_startCinchDn;
		obj.cinchUp			= HfdScroll_cinchUp;
		obj.cinchDn			= HfdScroll_cinchDn;
		obj.report			= HfdScroll_report;

		obj.getMembers(obj);

		obj.lastPos			= parseInt(obj.thumb.style.top);
		obj.thumbMin		= obj.btnUp.height + 1;
		obj.thumbMax		= obj.scrollerHeight - obj.btnDn.height - obj.thumb.height - 1;
		obj.thumbRange		= obj.thumbMax - obj.thumbMin;

		Drag.init(obj.thumb, obj.thumbMin, 0, obj.thumbMax, 0);
		Drag.init(obj.btnUp, 0, 0, obj.scrollerHeight-obj.btnUp.height, 0);
		Drag.init(obj.btnDn, 0, 0, obj.scrollerHeight-obj.btnDn.height, 0);

		obj.thumb.onDrag		= function(x,y)	{ this.parentNode.dragThumb(x, y); };
		obj.thumb.onDragStart	= function()	{ this.parentNode.startTrackPos(); };
		obj.thumb.onDragEnd		= function()	{ this.parentNode.stopTrackPos(); this.parentNode.startGlide(); };

		obj.btnUp.onDragStart	= function()	{ this.maxY = parseInt(this.parentNode.thumb.style.top) - this.parentNode.btnUp.height - 1 };
		obj.btnDn.onDragStart	= function()	{ this.minY = parseInt(this.parentNode.thumb.style.top) + this.parentNode.thumb.height + 1 };
		obj.btnUp.onDrag		= function(x,y) { this.parentNode.extendUp(y); };
		obj.btnDn.onDrag		= function(x,y) { this.parentNode.extendDn(y); };
		obj.btnUp.onDragEnd		= function(x,y)	{ this.parentNode.startCinchUp(y); };
		obj.btnDn.onDragEnd		= function(x,y)	{ this.parentNode.startCinchDn(y); };

		return obj;
	};
};

function HfdScroll_report(percent)
{
	// this is just a stub for what happens when the scroller is manipulated.
	// hook into this by doing <obj>.report = function(perecentReported) { ... };
	// where <obj> is the ref that was returned by HfdScroll_create( );
};

function HfdScroll_startCinchDn(y) 
{
	this.velocity	= this.startVelocity;
	this.endPos		= y - this.thumb.height - 1;
	this.startTime	= (new Date()).getTime();
	_curHfd			= this;
	this.timerId	= window.setInterval("_curHfd.cinchDn()", this.resolution);
};

function HfdScroll_cinchDn()
{
	var t	= (new Date()).getTime() - this.startTime;
	var ny	= parseInt(this.thumb.style.top) + this.velocity * t;
	ny = Math.round(Math.min(ny, this.endPos));
	this.thumb.style.top = ny + "px";
	this.btnUp.style.top = ny - this.btnUp.height - 1 + "px";
	this.extDn.style.clip = "rect(" + (this.extDn.height - 1 - (this.endPos + this.thumb.height - ny)) + "px auto auto auto)";
	this.extUp.style.top = ny - 1 + "px";

	if (ny >= this.endPos) {
		window.clearInterval(this.timerId);
		// i dunno - it just looked right.
		this.velocity *= 3;
		this.startGlide();
	}

	this.report((ny - this.thumbMin) / this.thumbRange * 100);

	// apply acceleration
	this.velocity += t * this.accel;
};

function HfdScroll_startCinchUp(y) 
{
	this.velocity	= -this.startVelocity;
	this.endPos		= parseInt(y + this.btnUp.height + 1);
	this.startTime	= (new Date()).getTime();
	_curHfd			= this;
	this.timerId	= window.setInterval("_curHfd.cinchUp()", this.resolution);
};

function HfdScroll_cinchUp()
{
	var t	= (new Date()).getTime() - this.startTime;
	var ny	= parseInt(this.thumb.style.top) + this.velocity * t;
	ny = Math.round(Math.max(ny, this.endPos));
	this.thumb.style.top = ny + "px";
	this.btnDn.style.top = ny + this.thumb.height + 1 + "px";
	this.extUp.style.clip = "rect(auto auto " + (parseInt(this.thumb.style.top) - parseInt(this.btnUp.style.top) - this.btnUp.height) + "px auto)";
	this.extDn.style.top = ny + this.thumb.height - this.extDn.height + 1 + "px";

	if (ny <= this.endPos) {
		window.clearInterval(this.timerId);
		// i dunno - it just looked right.
		this.velocity *= 3;
		this.startGlide();
	}

	this.report((ny - this.thumbMin) / this.thumbRange * 100);

	// apply acceleration
	this.velocity -= t * this.accel;
};

function HfdScroll_extendUp(y)
{
	this.extUp.style.top = y + this.btnUp.height + "px";
	this.extUp.style.clip = "rect(auto auto " + (parseInt(this.thumb.style.top) - parseInt(this.btnUp.style.top) - this.btnUp.height) + "px auto)";
};

function HfdScroll_extendDn(y)
{
	this.extDn.style.top = y - this.extDn.height + "px";
	this.extDn.style.clip = "rect(" + (this.extDn.height - 1 - (y - this.btnDn.minY)) + "px auto auto auto)";
};

function HfdScroll_dragThumb(x, y) 
{
	this.gotoThumbPos(y);
};

function HfdScroll_startGlide()
{
	this.lastTime		= (new Date()).getTime();
	_curHfd				= this;
	this.timerId		= window.setInterval("_curHfd.glide()", this.resolution);
	this.velocity		= Math.min2(this.velocity, this.velocity > 0 ? this.maxVelocity : -this.maxVelocity);
};

function HfdScroll_glide()
{
	this.absVelocity = Math.abs(this.velocity);

	if (this.absVelocity > 0) {
		var n = (new Date()).getTime()
		var t = n - this.lastTime;

		// apply friction
		this.absVelocity -= this.friction * t;
		this.velocity = this.absVelocity > 0 ? 
			this.absVelocity * (this.velocity > 0 ? 1 : -1) : 0;
		
		var y = Math.round(t * this.velocity + parseInt(this.thumb.style.top));

		this.lastTime = n;

		// bounce, if necessary
		if (y > this.thumbMax) {
			y = this.thumbMax - (y - this.thumbMax);
			this.velocity *= -1;
		} else if (y < this.thumbMin) {
			y = this.thumbMin + (this.thumbMin - y);
			this.velocity *= -1;
		};

		this.gotoThumbPos(y);
	} else {
		window.clearInterval(this.timerId);
	};
};

function HfdScroll_startTrackPos() 
{
	this.lastTime = (new Date()).getTime();
	this.trackPos();
	_curHfd = this;
	this.timerId = window.setInterval("_curHfd.trackPos()", this.resolution);
};

function HfdScroll_stopTrackPos() 
{
	this.trackPos();
	window.clearInterval(this.timerId);
	_curHfd = null;
};

function HfdScroll_trackPos() 
{
	var n			= (new Date()).getTime();
	if (n - this.lastTime > 0) {
		var ny			= parseInt(this.thumb.style.top);
		this.velocity	= (ny - this.lastPos) / (n - this.lastTime);
		this.lastTime	= n;
		this.lastPos	= ny;
	}
};

function HfdScroll_gotoThumbPos(y) 
{
	this.thumb.style.top = y + "px";
	this.btnDn.style.top = y + this.thumb.height + 1 + "px";
	this.btnUp.style.top = y - this.btnUp.height - 1 + "px";
	this.extDn.style.top = y + this.thumb.height - this.extDn.height + 1 + "px";
	this.extUp.style.top = y - 1 + "px";
	this.report((y - this.thumbMin) / this.thumbRange * 100);
};

function HfdScroll_getMembers(oNode) 
{
	if (oNode.childNodes)
	{
		for (var i = 0, c; i < oNode.childNodes.length; i++) 
		{
			c = oNode.childNodes[i];
			if      (c.className == "hfdScroll-extUp") this.extUp = c;
			else if (c.className == "hfdScroll-extDn") this.extDn = c;
			else if (c.className == "hfdScroll-thumb") this.thumb = c;
			else if (c.className == "hfdScroll-btnUp") this.btnUp = c;
			else if (c.className == "hfdScroll-btnDn") this.btnDn = c;
		
			if (c.childNodes && c.childNodes.length > 0)
				this.getMembers(c);
		};

	};

};

Math.max2 = function(num1, num2)
{
	return num1 * (num1 > 0 ? 1 : -1) > num2 * (num2 > 0 ? 1 : -1) ? num1 : num2 ;
};

Math.min2 = function(num1, num2)
{
	return num1 * (num1 > 0 ? 1 : -1) < num2 * (num2 > 0 ? 1 : -1) ? num1 : num2 ;
};
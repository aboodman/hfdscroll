var Drag = {

	obj : null,

	init : function(o, minY, maxX, maxY, minX)
	{
		o.onmousedown	= Drag.start;

		if (o.style.left == "") o.style.left = "0px";
		if (o.style.top  == "") o.style.top  = "0px";

		o.minX	= typeof minX != 'undefined' ? minX : null;
		o.minY	= typeof minY != 'undefined' ? minY : null;
		o.maxX	= typeof maxX != 'undefined' ? maxX : null;
		o.maxY	= typeof maxY != 'undefined' ? maxY : null;

		o.onDragStart	= new Function();
		o.onDragEnd		= new Function();
		o.onDrag		= new Function();
	},

	start : function(e)
	{
		var o = Drag.obj = this;
		o.onDragStart(x, y);

		e = Drag.fixE(e);
		var y = parseInt(o.style.top);
		var x = parseInt(o.style.left);

		o.lastMouseX	= e.clientX;
		o.lastMouseY	= e.clientY;

		if (o.minX != null)	o.minMouseX	= e.clientX - x + o.minX;
		if (o.minY != null)	o.minMouseY	= e.clientY - y + o.minY;
		if (o.maxX != null)	o.maxMouseX	= o.minMouseX + o.maxX - o.minX;
		if (o.maxY != null)	o.maxMouseY	= o.minMouseY + o.maxY - o.minY;

		document.onmousemove	= Drag.drag;
		document.onmouseup		= Drag.end;

		return false;
	},

	drag : function(e)
	{
		e = Drag.fixE(e);
		var o = Drag.obj;

		var ey	= e.clientY;
		var ex	= e.clientX;
		var y	= parseInt(o.style.top);
		var x	= parseInt(o.style.left);
		var nx, ny;

		if (o.minX != null) ex = Math.max(ex, o.minMouseX);
		if (o.maxX != null) ex = Math.min(ex, o.maxMouseX);
		if (o.minY != null) ey = Math.max(ey, o.minMouseY);
		if (o.maxY != null) ey = Math.min(ey, o.maxMouseY);

		nx = x + ex - o.lastMouseX;
		ny = y + ey - o.lastMouseY;

		Drag.obj.style.left = nx + "px";
		Drag.obj.style.top  = ny + "px";
		Drag.obj.lastMouseX	= ex;
		Drag.obj.lastMouseY	= ey;

		Drag.obj.onDrag(nx, ny);
		return false;
	},

	end : function()
	{
		document.onmousemove = null;
		document.onmouseup   = null;
		Drag.obj.onDragEnd(parseInt(Drag.obj.style.left), parseInt(Drag.obj.style.top));
		Drag.obj = null;
	},

	fixE : function(e)
	{
		if (!e) e = window.event;
		if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
		if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
		return e;
	}
};
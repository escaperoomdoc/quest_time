const screenWidth = 1280;
const screenHeight = 720;
qb = new QueenBridge(queenbridgeUrl, {
	id: 'timebraslet-' + brasletColor,
	keepOffline: null,
	override: false
});
var app = new PIXI.Application(screenWidth, screenHeight, { transparent: true });
document.body.appendChild(app.view);

colors = {};
colors['red'] = 0xFF0000;
colors['green'] = 0x00FF00;
colors['blue'] = 0x0000FF;
colors['yellow'] = 0xFFFF00;
colors['purple'] = 0xFF00FF;
colors['cyan'] = 0x00FFFF;
colorNames=['red', 'green', 'blue', 'yellow', 'purple', 'cyan'];

// implements base sprite functions: activate and deactivate
var BaseSprite = function () {
	this.activeSprites = false;
	this.activate = function() {
		this.activeSprites = true;
		this.sprite.gameProperty = this.gameProperty;
		app.stage.addChild(this.sprite);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === this.gameProperty) app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
		var stub = 0;
	}
};
baseSprite = new BaseSprite;

var textStyleTime = new PIXI.TextStyle({
	fontFamily: 'Arial',	//'Berlin Sans FB', 'Candara'
	fontSize: 120,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#28ff20']
});

var textStylePass = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 120,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#606060']
});

var textStylePassError = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 120,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#FF0000']
});

var textStyleZone = new PIXI.TextStyle({
	fontFamily: 'Courier New',
	fontSize: 80,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#ffffff']
});

var textStyleError = new PIXI.TextStyle({
	fontFamily: 'Courier New',
	fontSize: 32,
	fontStyle: 'normal',
	fontWeight: 'normal',
	fill: ['#ff0000']
});




var Text = function(text, style, x, y, gameProperty) {
	this.gameProperty = gameProperty;
	this.sprite = new PIXI.Text(text, style);
	this.sprite.x = x;
	this.sprite.y = y;
	this.setText = function(text) {
		this.text = text;
		this.sprite.text = this.text;
	}	
	this.setText(text);
}
Text.prototype = baseSprite;

var BaseTime = function () {
	String.prototype.padLeft = function (length, character) { 
		return new Array(length - this.length + 1).join(character || '0') + this; 
 	}
	this.updateText = function(time) {
		text  = time.years.toString().padLeft(4, '0');
		text += '∙';
		text += time.months.toString().padLeft(2, '0');
		text += '∙';
		text += time.days.toString().padLeft(2, '0');
		text += ' ';
		text += time.hours.toString().padLeft(2, '0');
		text += '∙';
		text += time.mins.toString().padLeft(2, '0');
		text += '∙';
		text += time.secs.toString().padLeft(2, '0');
		this.sprite.text = text;
	}
	this.raw2time = function(time) {
		time.mins = Math.floor(time.raw / 60);
		time.secs = time.raw - time.mins * 60;
		time.hours = Math.floor(time.mins / 60);
		time.mins = time.mins - time.hours * 60;
		time.days = Math.floor(time.hours / 24);
		time.hours = time.hours - time.days * 24;
		time.months = Math.floor(time.days / 30);
		time.days = time.days - time.months * 30;
		time.years = Math.floor(time.months / 12);
		time.months = time.months - time.years * 12;
	}	
}
BaseTime.prototype = baseSprite;
baseTime = new BaseTime();

var Time = function(time, style, x, y, gameProperty, interactive) {
	this.gameProperty = gameProperty;
	this.sprite = new PIXI.Text('9999∙99∙99 99∙99∙99', style);
	this.sprite.x = x;
	this.sprite.y = y;
	
	this.time = {};
	this.prev = {};
	this.animateFlag = false;

	this.setTime = function(value, animate) {
		this.prev.raw = this.time.raw;
		this.time.raw = value;
		this.raw2time(this.time)
		if (animate) {
			this.animateTime();			
		}
		else {
			this.updateText(this.time);
		}		
	}
	this.setTime(time);
	this.animateTime = function() {
		audioSuccess.play();
		var that = this;
		that.animateFrame = 0;
		that.animateFrames = 25;
		that.animateDelta = Math.floor((this.time.raw - this.prev.raw) / (that.animateFrames + 1));
		if (that.animateDelta < 0) that.animateDelta ++;
		function animateFunc() {
			that.prev.raw += that.animateDelta;
			that.raw2time(that.prev);
			that.updateText(that.prev);
			that.animateFrame ++;
			if (that.animateFrame < that.animateFrames) setTimeout(animateFunc, 200);
			else that.updateText(that.time);			
		}
		animateFunc();
	}
	this.pointInRect = function(x, y, l, t, w, h) {
		if (x >= l && x <= l + w && y >= t && y <= t + h) return true;
		return false;
	}
	if (interactive) {
		this.sprite.interactive = true;
		this.sprite.buttonMode = true;	
		this.sprite.on('pointertap', (event ) => {
			if (this.pointInRect(event.data.global.x, event.data.global.y, 80, 500, 270, 120)) {
				if (++this.time.years > 9999) this.time.years = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 380, 500, 135, 120)) {
				if (++this.time.months > 11) this.time.months = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 550, 500, 135, 120)) {
				if (++this.time.days > 29) this.time.days = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 710, 500, 135, 120)) {
				if (++this.time.hours > 23) this.time.hours = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 880, 500, 135, 120)) {
				if (++this.time.mins > 59) this.time.mins = 0;
			}
			if (this.pointInRect(event.data.global.x, event.data.global.y, 1050, 500, 135, 120)) {
				if (++this.time.secs > 59) this.time.secs = 0;
			}
			value = 	this.time.secs + this.time.mins * 60 + this.time.hours * 3600 +
						this.time.days * 86400 + this.time.months * 2592000 + this.time.years * 31104000;
			this.setTime(value);
			buttonTap(this.sprite.gameProperty);
		});	
	}
	this.animate = function() {
	}	
};
Time.prototype = baseTime;



var Live = function(colorName, x, y, radius) {
	this.colorName = colorName;
	this.color = colors[colorName];
	this.colorNow = this.color;
	this.graphics = new PIXI.Graphics();
	this.draw = function() {
		this.graphics.clear();
		this.graphics.lineStyle(0);
		this.graphics.beginFill(this.colorNow, 1);
		this.graphics.drawCircle(x, y, radius);
		this.graphics.endFill();
	}
	this.draw();
	this.activate = function() {
		this.activeSprites = true;
		this.graphics.gameProperty = "indi";
		app.stage.addChild(this.graphics);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === "indi") app.stage.removeChild(app.stage.children[i]);
		};	
	}	
	this.restoreColor = function() {
		if (this.activeSprites) {
			this.colorNow = this.color;
			this.draw();
		}
	}
	this.animate = function() {
		if (qb.connected && this.activeSprites) {
			this.colorNow = this.colorNow - (this.colorNow & 0xFF0000 ? 0x020000 : 0);
			this.colorNow = this.colorNow - (this.colorNow & 0x00FF00 ? 0x000200 : 0);
			this.colorNow = this.colorNow - (this.colorNow & 0x0000FF ? 0x000002 : 0);
			this.draw();
		}
	}
}

var Button = function(x, y, gameProperty) {
	this.button = PIXI.Sprite.fromImage('js/' + gameProperty + '.png');
	this.button.anchor.set(0);
	this.button.x = x;
	this.button.y = y;
	this.button.interactive = true;
	this.button.buttonMode = true;
	this.button.on('pointertap', () => {
		buttonTap(this.button.gameProperty);
	});
	this.activeSprites = false;
	this.activate = function() {
		this.activeSprites = true;
		this.button.gameProperty = gameProperty;
		app.stage.addChild(this.button);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === gameProperty) app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
	}
}

var Arrow = function(x, y, gameProperty) {
	this.onTap = function() {
		console.log(123);
	}
	this.colorIndex = 0;
	this.colorName = colorNames[this.colorIndex];
	this.color = colors[this.colorName];
	this.x = x;
	this.y = y;
	this.graphics = new PIXI.Graphics();
	this.graphics.interactive = true;
	this.graphics.buttonMode = true;	
	this.colorNow = this.color;
	this.draw = function() {
		this.graphics.beginFill(this.colorNow);
		this.graphics.lineStyle(4, this.colorNow, 1);
		this.graphics.moveTo(this.x - 30, this.y - 50);
		this.graphics.lineTo(this.x - 30, this.y + 20);
		this.graphics.lineTo(this.x - 80, this.y + 20);
		this.graphics.lineTo(this.x +  0, this.y + 80);
		this.graphics.lineTo(this.x + 80, this.y + 20);
		this.graphics.lineTo(this.x + 30, this.y + 20);
		this.graphics.lineTo(this.x + 30, this.y - 50);
		this.graphics.closePath();
		this.graphics.endFill();
	}
	this.draw();
	this.graphics.on('pointertap', () => {
		if (++this.colorIndex >= colorNames.length) this.colorIndex = 0;
		this.colorName = colorNames[this.colorIndex];
		this.color = colors[this.colorName];		
		this.colorNow = this.color;
		this.draw();
	});	
	this.restoreColor = function() {
		this.colorNow = this.color;
		this.draw();
	}	
	this.activate = function() {
		this.activeSprites = true;
		this.graphics.gameProperty = gameProperty;
		app.stage.addChild(this.graphics);
	}
	this.deactivate = function() {
		this.activeSprites = false;
		for (var i = app.stage.children.length - 1; i >= 0; i--) {
			if (app.stage.children[i].gameProperty === gameProperty) app.stage.removeChild(app.stage.children[i]);
		};	
	}
	this.animate = function() {
		return;
		if (this.activeSprites) {
			this.colorNow = this.colorNow - (this.colorNow & 0xFF0000 ? 0x010000 : 0);
			this.colorNow = this.colorNow - (this.colorNow & 0x00FF00 ? 0x000100 : 0);
			this.colorNow = this.colorNow - (this.colorNow & 0x0000FF ? 0x000001 : 0);
			this.draw();
		}		
	}	
}

var items = {};
items['error'] = new Text('', textStyleError, 10, 10, 'zone');
items['live'] = new Live(brasletColor, 120, 130, 40);
items['zone'] = new Text('ЗАВОД', textStyleZone, 920, 85, 'zone');
items['time'] = new Time(3600, textStyleTime, 80, 200, 'time');
items['buttonPasschar'] = new Button( 80, 500, 'buttonPasschar');
items['buttonPasstown'] = new Button(515, 500, 'buttonPasstown');
items['buttonGiveclue'] = new Button(950, 500, 'buttonGiveclue');
items['pass'] = new Time(0, textStylePass, 80, 500, 'pass', true);
items['buttonOk'] = new Button(80, 350, 'buttonOk');
items['buttonCancel'] = new Button(950, 350, 'buttonCancel');
items['arrow'] = new Arrow(620, 400, 'arrow');

function gotoError(error) {
	items['error'].activate();
	items['error'].setText(error);
	items['live'].deactivate();
	items['zone'].deactivate();
	items['time'].deactivate();
	items['buttonPasschar'].deactivate();
	items['buttonPasstown'].deactivate();
	items['buttonGiveclue'].deactivate();
	items['pass'].deactivate();
	items['buttonOk'].deactivate();
	items['buttonCancel'].deactivate();
	items['arrow'].deactivate();	
}
gotoError('waiting for connection...');

function gotoStart() {
	items['live'].activate();
	items['zone'].activate();
	items['time'].activate();
	items['buttonPasschar'].activate();
	items['buttonPasstown'].activate();
	items['buttonGiveclue'].activate();
	items['pass'].deactivate();
	items['buttonOk'].deactivate();
	items['buttonCancel'].deactivate();
	items['arrow'].deactivate();	
}

function buttonTap(buttonName) {
	if (buttonName === 'pass') {
		if (items['pass'].time.raw > items['time'].time.raw) {
			items['pass'].sprite.style = textStylePassError;
		}
		else {
			items['pass'].sprite.style = textStylePass;
		}
	}
	if (buttonName === 'buttonPasschar') {
		items['buttonPasschar'].deactivate();
		items['buttonPasstown'].deactivate();
		items['buttonGiveclue'].deactivate();
		items['pass'].activate();
		items['buttonOk'].activate();
		items['buttonCancel'].activate();
		items['arrow'].activate();
		items['pass'].setTime(0);
		items['pass'].sprite.style = textStylePass;
	}
	if (buttonName === 'buttonOk' || buttonName === 'buttonCancel') {
		if (buttonName === 'buttonOk') {
			if (items['pass'].time.raw > 0 ) {
				if (items['pass'].time.raw > items['time'].time.raw || items['live'].colorName === items['arrow'].colorName) {
					audioFail.play();
				}
				else {
					items['time'].setTime(items['time'].time.raw - items['pass'].time.raw, true);
					qb.send('timebraslet-' + colorNames[items['arrow'].colorIndex], {type: 'timepass', time: items['pass'].time.raw});
				}
			}
		}			
		items['buttonPasschar'].activate();
		items['buttonPasstown'].activate();
		items['buttonGiveclue'].activate();
		items['pass'].deactivate();
		items['buttonOk'].deactivate();
		items['buttonCancel'].deactivate();
		items['arrow'].deactivate();
	}	
}

app.ticker.add(function() {
	for (item in items) {
		items[item].animate();
	}
});

qb.on('ping', (data) => {
})
qb.on('connect', () => {
})
qb.on('disconnect', () => {
	gotoError('waiting for connection...');
})
qb.on('register', (data) => {
	gotoStart();
})
qb.on('error', (data) => {
	if (data.type === 'register') {
		gotoError(data.error);
	}
})
qb.on('receive', (msg) => {
	try {
		if (msg.payload ) {
			if (msg.payload.type === 'timepass') {
				items['time'].setTime(items['time'].time.raw + msg.payload.time, true);
			}
			if (msg.payload.type === 'json' && msg.payload.data && msg.payload.data.type === 'gadgettime') {
				items['time'].setTime(items['time'].time.raw + parseInt(msg.payload.data.value), true);
			}			
		} 
		
	}
	catch(error) {
	}
})

setInterval(() => {
	items['live'].restoreColor();
//	items['arrow'].restoreColor();
}, 1000 );


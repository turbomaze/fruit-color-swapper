/******************\
|   Image Color    |
|     Swapper      |
| @author Anthony  |
| @version 0.1     |
| @date 2014/05/31 |
| @edit 2014/05/31 |
\******************/

/**********
 * config */
var apple = 'apple.jpg';
var banana = 'banana.jpg';
var kiwi = 'kiwi.jpg';
var orange = 'orange.jpg';
var peach = 'peach.jpg';
var plum = 'plum.png';
var strawberry = 'strawberry.jpg';
var NUM_CANVASES = 2;

/*************
 * constants */

/*********************
 * working variables */
var filterHandlers;

/******************
 * work functions */
function initColorSwapper() {
	////////////////////////////////
	//initialize working variables//
	filterHandlers = [];
	for (var ai = 0; ai < NUM_CANVASES; ai++) {
		var canvas = $s('canvas'+ai);
		filterHandlers.push(new FilterHandler(canvas));
		
		////////////////////////////////////////////////////////////////////////////////
		//call the updateCanvas() function of the filterhandlers when the changes size//
		(function() {
			var fh = filterHandlers[ai];
			fh.canvas.addEventListener('CanvasResize', function() {
				fh.updateCanvas();
			});
		})();
	}
	
	//////////////////////////////////
	//give the buttons functionality//
    function loadPic(name, num) {
        getPixelsFromImage(name, function(pixels, width) {
			filterHandlers[num].intendedWidth = width;
			filterHandlers[num].pixels = pixels;
			filterHandlers[num].updateCanvas();
		});
    }
	$s('btn1').addEventListener('click', function() {loadPic(apple, 0)});
	$s('btn2').addEventListener('click', function() {loadPic(banana, 0)});
	$s('btn3').addEventListener('click', function() {loadPic(kiwi, 0)});
	$s('btn4').addEventListener('click', function() {loadPic(orange, 0)});
	$s('btn5').addEventListener('click', function() {loadPic(peach, 0)});
	$s('btn6').addEventListener('click', function() {loadPic(plum, 0)});
	$s('btn7').addEventListener('click', function() {loadPic(strawberry, 0)});

	$s('btn8').addEventListener('click', function() {loadPic(apple, 1)});
	$s('btn9').addEventListener('click', function() {loadPic(banana, 1)});
	$s('btn10').addEventListener('click', function() {loadPic(kiwi, 1)});
	$s('btn11').addEventListener('click', function() {loadPic(orange, 1)});
	$s('btn12').addEventListener('click', function() {loadPic(peach, 1)});
	$s('btn13').addEventListener('click', function() {loadPic(plum, 1)});
	$s('btn14').addEventListener('click', function() {loadPic(strawberry, 1)});

	$s('btn15').addEventListener('click', function() { //switch the colors of the fruits
        var mainColor0 = filterHandlers[0].getMainColor();
        var mainColor1 = filterHandlers[1].getMainColor();
        filterHandlers[0].changeColor(mainColor0, mainColor1)
		filterHandlers[0].updateCanvas();
        filterHandlers[1].changeColor(mainColor1, mainColor0)
		filterHandlers[1].updateCanvas();
	});
}
 
/********************
 * helper functions */
function getPixelsFromImage(location, callback) { //returns array of pixel colors in the image
	var timeStartedGettingPixels = new Date().getTime();
	var img = new Image(); //make a new image
	img.onload = function() { //when it is finished loading
		var canvas = document.createElement('canvas'); //make a canvas element
		canvas.width = img.width; //with this width
		canvas.height = img.height; //and this height (keep it the same as the image)
		canvas.style.display = 'none'; //hide it from the user
		document.body.appendChild(canvas); //then add it to the document's body
		var ctx = canvas.getContext('2d'); //now get the context
		ctx.drawImage(img, 0, 0, img.width, img.height); //so that you can draw the image
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); //and grab its pixels
		document.body.removeChild(canvas); //all done, so get rid of it
		
		//...all so you can send the pixels, width, and the time taken to get them back through the callback
		var ret = [];
		for (var ai = 0; ai < imageData.data.length; ai++) ret.push(imageData.data[ai]); //annoying copy so the array can be edited
		callback(ret, img.width, new Date().getTime() - timeStartedGettingPixels); 
	};

	img.src = location; //load the image
}

function $s(id) { //ghetto jquery: IDS ONLY
	return document.getElementById(id);
}
 
function getRandInt(low, high) { //output is in [low, high)
	return Math.floor(low + Math.random()*(high-low));
}

function round(n, places) {
	var mult = Math.pow(10, places);
	return Math.round(mult*n)/mult;
}
 
/***********
 * objects */
function FilterHandler(canvas) {
	this.canvas = canvas;
	this.ctx = this.canvas.getContext('2d');
	this.pixels = []; //what's supposed to be on the screen when resizing erases the canvas
	this.intendedWidth = 0; //the width the pixels should be viewed at
	
	function updateCanvas() { //redraws the image data to fit whatever the current size is
		//////////////////////////////
		//non-white background color//
		this.ctx.fillStyle = "#CCE6D0";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		//////////////////////////////////////////////
		//redraw the pixels from the top left corner//
		var currImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		var intendedHeight = this.pixels.length/(4*this.intendedWidth);
		for (var y = 0; y < intendedHeight; y++) { //for all intended rows
			if (y >= this.canvas.height) break;
			for (var x = 0; x < this.intendedWidth; x++) { //and for each intended column
				if (x >= this.canvas.width) break;
				var idxInPixels = 4*(this.intendedWidth*y + x); //idx of this pixel in the pixels array
				var idxInCanvas = 4*(this.canvas.width*y + x); //corresponding idx in the canvas, starting at corner (0,0)
				for (var c = 0; c < 4; c++) { //and for all three colors, lol c++
					currImageData.data[idxInCanvas+c] = this.pixels[idxInPixels+c];
				}
			}
		}
		this.ctx.putImageData(currImageData, 0, 0);
	}
	
	function changeColor(fromCol, toCol) {
		function colorIsGood(c) {
            var total = Math.sqrt(c[0]*c[0] + c[1]*c[1] + c[2]*c[2]);
            return total > 10 && total < 400;
        }

        function invertColor(color) {
            return [255-color[0], 255-color[1], 255-color[2]];
        }

        function multiplyColor(col1, col2) { //rgb 0-255
            var ret = [];
            for (var ai = 0; ai < 3; ai++) {
                ret.push(Math.floor((col1[ai]*col2[ai])/255));
            }
            return ret;
        }

        function divideColor(col1, col2) { //rgb 0-255
            var ret = [];
            for (var ai = 0; ai < 3; ai++) {
                ret.push(Math.floor((col1[ai]*col2[ai])/255));
            }
            return ret;
        }

        function mergeColors(minor, major) {
            var ret = [];
            for (var ai = 0; ai < 3; ai++) {
                if (major[ai] < 128) {
                    ret.push((major[ai]*minor[ai])/128);
                } else {
                    ret.push(255 - ((255-major[ai])*(255-minor[ai]))/128);
                }
            }
            return ret;
        }

		for (var p = 0; p < this.pixels.length; p+=4) { //for all pixels in the image
            var currColor = [this.pixels[p], this.pixels[p+1], this.pixels[p+2]];
			if (colorIsGood(currColor)) {
                var merge = mergeColors(currColor, toCol);
                this.pixels[p] = merge[0];
                this.pixels[p+1] = merge[1];
                this.pixels[p+2] = merge[2];
            }
		}
	}

    function getMainColor() {
        function colorIsGood(c) {
            var total = Math.sqrt(c[0]*c[0] + c[1]*c[1] + c[2]*c[2]);
            return total > 50 && total < 400;
        }

        var colorsLookedAt = 0;
        var color = [0, 0, 0];
		for (var p = 0; p < this.pixels.length; p+=4) { //for all pixels in the image
            var currColor = [this.pixels[p], this.pixels[p+1], this.pixels[p+2]];
			if (colorIsGood(currColor)) {
                colorsLookedAt++;
                color[0] += currColor[0];
                color[1] += currColor[1];
                color[2] += currColor[2];
            }
		}
        return [color[0]/colorsLookedAt, color[1]/colorsLookedAt, color[2]/colorsLookedAt];
    }
		
	this.updateCanvas = updateCanvas;
    this.getMainColor = getMainColor;
    this.changeColor = changeColor;
}

window.addEventListener('load', initColorSwapper);












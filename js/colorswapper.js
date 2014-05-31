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
var IMG_NAME = 'image.jpg';
var NUM_CANVASES = 2;

/*************
 * constants */
var gaussianBlurFilter = getGaussian(7, 7);
var gaussianBlurFilterX = getGaussian(1, 7);
var gaussianBlurFilterY = getGaussian(7, 1);
var d_dxFilter = [[-1, 0, 1], 
				  [-1, 0, 1], 
				  [-1, 0, 1]];
var d_dyFilter = [[-1, -1, -1], 
				  [0, 0, 0], 
				  [1, 1, 1]];

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
		var canvas = $('canvas'+ai);
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
	$('btn1').addEventListener('click', function() { //load an image into C1
		getPixelsFromImage(IMG_NAME, function(pixels, width) {
			filterHandlers[0].intendedWidth = width;
			filterHandlers[0].pixels = pixels;
			filterHandlers[0].updateCanvas();
		});
	});
	$('btn2').addEventListener('click', function() { //blur C1 and load that into C2
		filterHandlers[1].intendedWidth = filterHandlers[0].intendedWidth;
		//filterHandlers[1].pixels = filterHandlers[0].applyFilter(gaussianBlurFilterX); //x direction
		//filterHandlers[1].pixels = filterHandlers[1].applyFilter(gaussianBlurFilterY); //y direction
		filterHandlers[1].pixels = filterHandlers[0].applyFilter(gaussianBlurFilter); 
		filterHandlers[1].updateCanvas();
	});
	$('btn3').addEventListener('click', function() { //differentiate C1 along x and load that into C2
		filterHandlers[1].intendedWidth = filterHandlers[0].intendedWidth;
		filterHandlers[1].pixels = filterHandlers[0].applyFilter(d_dxFilter);
		filterHandlers[1].updateCanvas();
	});
	$('btn4').addEventListener('click', function() { //differentiate C1 along y and load that into C2
		filterHandlers[1].intendedWidth = filterHandlers[0].intendedWidth;
		filterHandlers[1].pixels = filterHandlers[0].applyFilter(d_dyFilter);
		filterHandlers[1].updateCanvas();
	});
	$('btn5').addEventListener('click', function() { //swap the canvases
		var temp = [filterHandlers[0].pixels.slice(0), filterHandlers[0].intendedWidth];
		filterHandlers[0].pixels = filterHandlers[1].pixels.slice(0);
		filterHandlers[0].intendedWidth = filterHandlers[1].intendedWidth;
		filterHandlers[1].pixels = temp[0];
		filterHandlers[1].intendedWidth = temp[1];
		
		filterHandlers[0].updateCanvas();
		filterHandlers[1].updateCanvas();
	});
}

function getGaussian(rows, cols) {
	var getGaussianValueAt = function(x, y, sigma) {
		sigma = sigma || 0.84089642;
		return (1/(2*Math.PI*sigma*sigma))*Math.exp(-(x*x+y*y)/(2*sigma*sigma));
	};
	var ret = [];
	var yRadius = (rows-1)/2
	var xRadius = (cols-1)/2
	for (var y = -yRadius; y <= yRadius; y++) {
		ret.push([]);
		for (var x = -xRadius; x <= xRadius; x++) {
			ret[y+yRadius].push(getGaussianValueAt(x, y));
		}
	}
	return ret;
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

function $(id) { //ghetto jquery: IDS ONLY
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
	
	function applyFilter(filter) {
		if (filter.length%2 == 0 || filter[0].length%2 == 0) return false; //requires odd dimensions
		var count = 0;
		
		var copy = [];
		var yMargin = (filter.length-1)/2; //which pixels to skip due to y
		var xMargin = (filter[0].length-1)/2; //" " due to x
		var intendedHeight = this.pixels.length/(4*this.intendedWidth);
		for (var y = 0; y < intendedHeight; y++) { //for all intended rows
			for (var x = 0; x < this.intendedWidth; x++) { //and for each intended column
				for (var c = 0; c < 4; c++) { //and for each color channel
					var idx = 4*(this.intendedWidth*y + x)+c;
					if (c == 3) {
						copy.push(this.pixels[idx]); //keep the original alpha values
						continue; //move on to the next pixel
					} else copy.push(0); //copy array starts as a blank slate
					
					//////////////////////////////////////////////////////
					//iterate over all the pixels in the filter's window//
					for (var fy = 0; fy < filter.length; fy++) {
						for (var fx = 0; fx < filter[0].length; fx++) {
							var isOutsideImage = (y-yMargin+fy < 0 || y-yMargin+fy >= intendedHeight) ||
												 (x-xMargin+fx < 0 || x-xMargin+fx >= this.intendedWidth);
							var wIdx = 4*(this.intendedWidth*(y-yMargin+fy) + (x-xMargin+fx))+c;
							var val = filter[fy][fx]*(isOutsideImage ? 0 : this.pixels[wIdx]);
//if (x == 51 && y == 72) console.log(c+' '+val); 
							copy[idx] += val;
						}
					}
//if (x == 51 && y == 72) console.log(c+' '+copy[idx]); 
					copy[idx] = Math.min(Math.max(Math.floor(copy[idx]), 0), 255); //colors in [0, 256)
				}
			}
		}
		
		return copy;
	}
		
	this.updateCanvas = updateCanvas;
	this.applyFilter = applyFilter;
}

window.addEventListener('load', initColorSwapper);












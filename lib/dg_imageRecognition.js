/** @module dg_imageRecognition */

module.exports = {
    
};

const spawn = require('child_process').spawn;
var FEN

// read the image and convert to base64
var base64arg = new Buffer(bitmap).toString('base64');

// python-process (use 'python3.6' on ubuntu and 'python' on windows)
const child = spawn('python3.6', ['chess_camera_04.py']);

// pipe the image
child.stdin.write(base64arg);
child.stdin.end();


child.stdout.on('data', (data) => {
	FEN=data.toString();
	// print the result
	console.log(FEN)
});

child.stderr.on('data', (data) => {
  console.error('child stderr:\n${data}');
});
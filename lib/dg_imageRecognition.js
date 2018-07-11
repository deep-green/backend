/** @module dg_imageRecognition */

const spawn = require('child_process').spawn;
const platform = require('os').platform();

/**
 * Calculates a FEN string based on information from a picture of a chess game.
 * The picture is handed over as a buffer object in which the picture is stored as a base64 encoded string.
 * The function then uses an external python module in which the calculations are done. 
 * 
 * @param {Object} buffer - the buffer object in which the picture is stored in base64 coding
 * @param {String} pyModulePath - the path to the python file in which the calculations take place
 * 
 * @returns {String} the FEN string calculated on the passed picture
 */
function getFEN(buffer, pyModulePath) {
    return new Promise((resolve, reject) => {
        let pyBin = 'python3.6';
        let resultFEN = '';
        let procDone = false;

        if(platform === 'win32') {
            pyBin = 'python';
        }

        let ImageReader = spawn(pyBin, [pyModulePath]);

        // send buffer to input stream and close input stream
        ImageReader.stdin.write(buffer);
        ImageReader.stdin.end();
        
        // append chunk of data to result FEN if a chunk occurs on stdout
        ImageReader.stdout.on('data', (chunk) => {
            resultFEN = resultFEN + chunk;
        });

        // RESOLVE if stdout stream is read completely
        ImageReader.stdout.on('end', () => {
            procDone = true;
            resolve(String(resultFEN));
        });
    
        //REJECT promise and KILL ImageReader if stderr emits something
        ImageReader.stderr.on('data', (data) => {
            procDone = true;
            ImageReader.kill('SIGKILL');
            reject(data);
        });

        //watch for process to exit 
        if(procDone === false) {
            ImageReader.on('exit', () => {
                reject('process terminated without returning FEN')
            });
        }

    });
}

module.exports = {
    getFEN
};

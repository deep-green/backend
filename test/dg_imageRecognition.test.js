
const fs = require('fs');
const dg_cv = require(__dirname + '/../lib/dg_imageRecognition')
describe('check computer vision module', () => {

    test('computer vision module returns correct FEN', (done) => {

        //get test image
        var image = fs.readFileSync(__dirname + '/img/testDummy.png');
        var base64arg = new Buffer(image).toString('base64');
        let testData = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        //call function
        return dg_cv.getFEN(base64arg, (__dirname + '/../computervision/py_modules/chess_camera_04.py'))
        .then((data) => {
            data = data.replace(/(\r\n|\n|\r)/gm," ").trim();
            expect(data).toEqual(testData);
            done();
        });     
    });

    test('computer vision module does NOT return incorrect FEN', (done) => {
        //get test image
        var image = fs.readFileSync(__dirname + '/img/testDummy.png');
        var base64arg = new Buffer(image).toString('base64');
        let testData = "rnbqkbnr/pppPPppp/8/8/8/8/PPPppPPP/RNBQKBNR w KQkq - 1 0";

        //call function
        return dg_cv.getFEN(base64arg, (__dirname + '/../computervision/py_modules/chess_camera_04.py'))
        .then((data) => {
            data = data.replace(/(\r\n|\n|\r)/gm," ").trim();
            expect(data).not.toEqual(testData);
            done();
        });     
    });
});

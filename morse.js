var request = require('request');
var fs = require('fs');
var streamToBuffer = require('stream-to-buffer');
var morseLib = require('morse');

function submit(token, answer, callback) {
    request.post('https://hdfw-tehgame.herokuapp.com/challenge/morse-mp3/verify',
        {
            headers: {'Authorization': 'Bearer ' + token},
            json: {answer: answer}
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body);
            } else {
                callback(null);
            }
        });
}

var parts = ['long', 'short', 'silent'];
var letters = ['-', '.', ' '];
var buffers = [];

function init(index, done) {
    if (typeof index === 'undefined') index = 0;
    if (typeof index === 'function') {
        done = index;
        index = 0;
    }
    if (index >= parts.length) return done();
    var part = parts[index];
    var stream = fs.createReadStream('mp3/' + part + '.mp3');
    streamToBuffer(stream, function (err, buffer) {
        if (err) return console.log(err);
        buffers[index] = buffer;
        init(index + 1, done);
    });
}

function getMorse(buffer, callback) {
    process.nextTick(function () {
        var offset = 0;
        var morse = '';
        var length = buffer.length;
        while (offset < length) {
            var found = false;
            for (var i = 0; i < parts.length; i++) {
                var letter = letters[i];
                var letterBuffer = buffers[i];
                var letterLength = letterBuffer.length;
                var end = offset + letterLength;
                if (end > length) continue;
                if (buffer.slice(offset, end).compare(letterBuffer) == 0) {
                    found = true;
                    morse += letter;
                    offset += letterLength;
                    break;
                }
            }
            if (!found) break;
        }
        callback(morse);
    });
}

module.exports = function (token, cipher) {
    if (buffers.length == 0) {
        init(function () {
            module.exports(token, cipher);
        });
        return;
    }
    var buffer = new Buffer(cipher, 'base64');
    getMorse(buffer, function (morse) {
        if (morse) {
            console.log('morse: morse = ' + morse);
            var answer = morseLib.decode(morse);
            console.log('morse: answer = ' + answer);
            submit(token, answer, function (body) {
                console.log('morse: result = ');
                console.log(body);
            });
        }
    });
};
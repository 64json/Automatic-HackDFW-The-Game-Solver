var request = require('request');

function submit(email, answer, callback) {
    request.post('https://hdfw-tehgame.herokuapp.com/puzzle/caesar/' + email,
        {json: {answer: answer}},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body);
            } else {
                callback(null);
            }
        });
}

function submitAll(email, plains, index) {
    if (typeof index === 'undefined') index = 0;
    if (index >= plains.length) return;
    console.log('caesar: submit(' + plains[index] + ')');
    submit(email, plains[index], function (body) {
        console.log('caesar: result = ');
        console.log(body);
        if (body.status === 'success' && !body.result) {
            submitAll(email, plains, index + 1);
        }
    });
}

function solve(cip, callback) {
    var plns = [];
    for (var i = 0; i < 26; i++) {
        var pln = '';
        for (var j = 0; j < cip.length; j++) {
            var s;
            var c = cip.charCodeAt(j);
            if (97 <= c && c <= 122) s = 97;
            else s = 65;
            pln += String.fromCharCode(((c - s) + i) % 26 + s);
        }
        plns.push(pln);
    }
    callback(plns);
}

module.exports = function (email, cipher) {
    solve(cipher, function (plains) {
        if (plains) {
            console.log('caesar: plains = ' + plains);
            submitAll(email, plains);
        }
    });
};
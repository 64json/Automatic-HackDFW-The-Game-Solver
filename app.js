var request = require('request');

var email = process.env.EMAIL;
var password = process.env.PASSWORD;

function submit(answer, callback) {
    request.post('https://hdfw-tehgame.herokuapp.com/puzzle/caesar/' + email,
        {json: {answer: answer}},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                callback(body.status);
            } else {
                callback(null);
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

function getCipher(token, callback) {
    request('https://hdfw-tehgame.herokuapp.com/challenge/caesar',
        {
            headers: {
                'Authorization': 'Bearer ' + token
            },
            json: {}
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.status === 'error') {
                    console.error(body.error);
                    callback(null);
                } else {
                    callback(body.challenge.start);
                }
            } else {
                console.error(body);
                callback(null);
            }
        });
}

function getToken(callback) {
    request.post('https://hdfw-tehgame.herokuapp.com/auth/login',
        {json: {email: email, password: password}},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body.token);
            } else {
                console.error(body);
                callback(null);
            }
        });
}

function submitAll(plains, index) {
    if (typeof index === 'undefined') index = 0;
    if (index >= plains.length) return;
    console.log('submit(' + plains[index] + ')');
    submit(plains[index], function (status) {
        console.log('status = ' + status);
        if (status === 'error') {
            submitAll(plains, index + 1);
        }
    });
}

var CronJob = require('cron').CronJob;
new CronJob('0 */5 * * * *', function () {
    console.log('————————————————');
    console.log('cron job started');
    getToken(function (token) {
        if (token) {
            console.log('token = ' + token);
            getCipher(token, function (cipher) {
                if (cipher) {
                    console.log('cipher = ' + cipher);
                    solve(cipher, function (plains) {
                        if (plains) {
                            console.log('plains = ' + plains);
                            submitAll(plains);
                        }
                    });
                }
            });
        }
    });
}, null, true);

process.stdin.resume();
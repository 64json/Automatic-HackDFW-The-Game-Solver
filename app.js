var request = require('request');

var email = process.env.EMAIL;
var password = process.env.PASSWORD;

var Caesar = require('./caesar');
var Vigenere = require('./vigenere');

function getCipher(token, challenge, callback) {
    request('https://hdfw-tehgame.herokuapp.com/challenge/' + challenge,
        {
            headers: {'Authorization': 'Bearer ' + token},
            json: {}
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.status === 'error') {
                    console.log(body.error);
                    callback(null);
                } else {
                    callback(body.challenge.start);
                }
            } else {
                console.log(error || response.statusCode);
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
                console.log(error || response.statusCode);
                callback(null);
            }
        });
}

var CronJob = require('cron').CronJob;
new CronJob('0 * * * * *', function () {
    console.log('————————————————');
    console.log('cron job started');
    getToken(function (token) {
        if (token) {
            console.log('token = ' + token);
            getCipher(token, 'caesar', function (cipher) {
                if (cipher) {
                    console.log('caesar cipher = ' + cipher);

                    Caesar(email, cipher);
                }
            });
            getCipher(token, 'vigenere', function (cipher) {
                if (cipher) {
                    console.log('vigenere cipher = ' + cipher);

                    Vigenere(token, cipher);
                }
            });
        }
    });
}, null, true);

process.stdin.resume();
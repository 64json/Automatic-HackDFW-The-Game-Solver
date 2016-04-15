var CronJob = require('cron').CronJob;
var request = require('request');

var email = process.env.EMAIL;
var password = process.env.PASSWORD;
var token = null;

var Caesar = require('./caesar');
var Vigenere = require('./vigenere');
var Playfair = require('./playfair');
var Morse = require('./morse');

function getCipher(token, challenge, callback) {
    request('https://hdfw-tehgame.herokuapp.com/challenge/' + challenge,
        {
            headers: {'Authorization': 'Bearer ' + token},
            json: {}
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.status === 'error') {
                    console.log(challenge + ': ' + body.error);
                    if (~body.error.indexOf('authorization')) getToken();
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

function getToken(next) {
    request.post('https://hdfw-tehgame.herokuapp.com/auth/login',
        {json: {email: email, password: password}},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                token = body.token;
                console.log('token = ' + token);
                if (next) next();
            } else {
                console.log(error || response.statusCode);
            }
        });
}

getToken(function () {
    new CronJob('0 * * * * *', function () {
        console.log('————————————————');
        console.log('cron job started: caesar');
        getCipher(token, 'caesar', function (cipher) {
            if (cipher) {
                console.log('caesar cipher = ' + cipher);

                Caesar(email, cipher);
            }
        });
    }, null, true);

    new CronJob('15 * * * * *', function () {
        console.log('————————————————');
        console.log('cron job started: vigenere');
        getCipher(token, 'vigenere', function (cipher) {
            if (cipher) {
                console.log('vigenere cipher = ' + cipher);

                Vigenere(token, cipher);
            }
        });
    }, null, true);

    new CronJob('30 * * * * *', function () {
        console.log('————————————————');
        console.log('cron job started: playfair');
        getCipher(token, 'playfair', function (cipher) {
            if (cipher) {
                console.log('playfair cipher = ' + cipher);

                Playfair(token, cipher);
            }
        });
    }, null, true);

    new CronJob('45 * * * * *', function () {
        console.log('————————————————');
        console.log('cron job started: morse');
        getCipher(token, 'morse-mp3', function (cipher) {
            if (cipher) {
                console.log('morse cipher = ' + cipher.substring(0, 100) + ' ...');

                Morse(token, cipher);
            }
        });
    }, null, true);
});

new CronJob('0 0 * * * *', function () {
    console.log('————————————————');
    console.log('cron job started: login');
    getToken();
}, null, true);

process.stdin.resume();
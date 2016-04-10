var request = require('request');

function submit(token, answer, callback) {
    request.post('https://hdfw-tehgame.herokuapp.com/challenge/vigenere/verify',
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

var table = {
    a: 'abcdefghijklmnopqrstuvwxyz',
    b: 'bcdefghijklmnopqrstuvwxyza',
    c: 'cdefghijklmnopqrstuvwxyzab',
    d: 'defghijklmnopqrstuvwxyzabc',
    e: 'efghijklmnopqrstuvwxyzabcd',
    f: 'fghijklmnopqrstuvwxyzabcde',
    g: 'ghijklmnopqrstuvwxyzabcdef',
    h: 'hijklmnopqrstuvwxyzabcdefg',
    i: 'ijklmnopqrstuvwxyzabcdefgh',
    j: 'jklmnopqrstuvwxyzabcdefghi',
    k: 'klmnopqrstuvwxyzabcdefghij',
    l: 'lmnopqrstuvwxyzabcdefghijk',
    m: 'mnopqrstuvwxyzabcdefghijkl',
    n: 'nopqrstuvwxyzabcdefghijklm',
    o: 'opqrstuvwxyzabcdefghijklmn',
    p: 'pqrstuvwxyzabcdefghijklmno',
    q: 'qrstuvwxyzabcdefghijklmnop',
    r: 'rstuvwxyzabcdefghijklmnopq',
    s: 'stuvwxyzabcdefghijklmnopqr',
    t: 'tuvwxyzabcdefghijklmnopqrs',
    u: 'uvwxyzabcdefghijklmnopqrst',
    v: 'vwxyzabcdefghijklmnopqrstu',
    w: 'wxyzabcdefghijklmnopqrstuv',
    x: 'xyzabcdefghijklmnopqrstuvw',
    y: 'yzabcdefghijklmnopqrstuvwx',
    z: 'zabcdefghijklmnopqrstuvwxy'
};

function toUpperCase(char, yes) {
    if (yes) {
        return char.toUpperCase();
    } else {
        return char;
    }
}

function solve(cip, callback) {
    var keyword = 'hackdfw';
    var areUppers = [];
    for (var i = 0; i < cip.length; i++) {
        var char = cip.charCodeAt(i);
        areUppers.push(65 <= char && char <= 90);
    }
    cip = cip.toLowerCase();
    var pln = '';
    var cnt = 0;
    for (var i = 0; i < cip.length; i++) {
        var keyLetter = (i - cnt) % keyword.length;
        var keyRow = table[keyword[keyLetter]];
        var index = keyRow.indexOf(cip[i]);
        pln += toUpperCase(table.a[index], areUppers[i]);
    }
    callback(pln);
}

module.exports = function (token, cipher) {
    solve(cipher, function (answer) {
        if (answer) {
            console.log('vigenere: answer = ' + answer);
            submit(token, answer, function (body) {
                console.log('vigenere: result = ');
                console.log(body);
            });
        }
    });
};
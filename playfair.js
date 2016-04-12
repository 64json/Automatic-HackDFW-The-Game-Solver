var request = require('request');

function submit(token, answer, callback) {
    request.post('https://hdfw-tehgame.herokuapp.com/challenge/playfair/verify',
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

function submitAll(token, plains, index) {
    if (typeof index === 'undefined') index = 0;
    if (index >= plains.length) return;
    console.log('playfair: submit(' + plains[index] + ')');
    submit(token, plains[index], function (body) {
        console.log('playfair: result = ');
        console.log(body);
        if (body.status === 'success' && !body.result) {
            submitAll(token, plains, index + 1);
        }
    });
}

var plns, pln;

function dfsI(i) {
    if (i == pln.length) {
        return plns.push(pln.join(''));
    }
    dfsI(i + 1);
    if (pln[i] == 'I') {
        pln[i] = 'J';
        dfsI(i + 1);
        pln[i] = 'I';
    }
}

function dfsX(i) {
    if (i == -1) {
        return dfsI(0);
    }
    if (pln[i] == 'X') {
        pln[i] = '';
        dfsX(i - 1);
        pln[i] = 'X';
    }
    dfsX(i - 1);
}

function decode(cip, callback) {
    request.post('http://www.dcode.fr/api/',
        {
            headers: {
                'Referer': 'http://www.dcode.fr/playfair-cipher',
                'Host': 'www.dcode.fr',
                'Origin': 'http://www.dcode.fr'
            },
            form: {
                tool: 'playfair-cipher',
                ciphertext: cip,
                grid: 'H;A;C;K;D;F;W;B;E;G;I;L;M;N;O;P;Q;R;S;T;U;V;X;Y;Z',
                grid_h: 5,
                grid_w: 5,
                shift_same_line: 'left',
                shift_same_column: 'up',
                order_rectangle: false
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(JSON.parse(body).results);
            } else {
                console.log(body);
                callback(null);
            }
        });
}

module.exports = function (token, cipher) {
    decode(cipher, function (plain) {
        if (plain) {
            console.log('playfair: plain = ' + plain);
            plns = [];
            pln = plain.split('');
            dfsX(pln.length - 1);
            submitAll(token, plns);
        }
    });
};
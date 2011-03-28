function pairRandom(arr){
    var first = Math.floor(Math.random() * (arr.length));
    var second = -1;
    var ret = [];
    do {
        second = Math.floor(Math.random() * (arr.length));
    } while(first == second);
    ret.push({
        id : arr[first].value._id,
        url : '/files/'+ arr[first].value._id,
        otherid : arr[second].value._id});
    ret.push({
        id : arr[second].value._id,
        url : '/files/'+ arr[second].value._id,
        otherid: arr[first].value._id});
    return ret;
}

var express = require('express');
var http = require('http');


var app = express.createServer();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
	app.use(express.logger());
	app.use(express.static(__dirname + '/static'));
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

var data = require('./data');



app.get('/', function(req, httpResponse) {
    data.all(function(err, res) {
        var pair = pairRandom(res);
        httpResponse.render('main', {
            locals : {images : pair}
        });
    });
});

app.get('/vote/:win/:lose', function(req, httpResponse) {
    var win = req.params.win;
    var lose = req.params.lose;
    data.get(win, function(err, res) {
        var wins = res.wins;
        data.updateWins(win, wins + 1, function(err2, res2) {
            
        });
    });
    data.get(lose, function(err, res) {
        var losses = res.losses;
        data.updateLosses(lose, losses + 1, function(err2, res2) {
            
        });
    });
    httpResponse.redirect('/');
});

app.get('/files/:id', function(req, httpResponse) {
    var id = req.params.id;
    
    data.get(id, function(err, res) {
        var filename = res.filename;
        var options = {
            host: 'localhost',
            port: 5984,
            path: '/pictures/' + id + '/' + filename
        };
        http.get(options, function(res) {
            res.setEncoding('binary');
            var image = '';
            res.on('data', function(chunk) {
                image += chunk;
            });
            res.on('end', function() {
                var buf = new Buffer(image, 'binary');
                httpResponse.contentType('image/jpeg');
                httpResponse.send(buf, 200);
            });
        });
    });
    
});

app.listen(4000);
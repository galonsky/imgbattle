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
var data = require('./data');

function elo(winner, loser){
    var current1 = winner.doc.rating;
    var current2 = loser.doc.rating;
    var E = 0;
    var score1 = 20;
    var score2 = 10;
    
    E = 120 - Math.round(1 / (1 + Math.pow(10, ((current2 - current1) / 400))) * 120);
    
    data.updateRating(winner.id, current1 + E, function(err, res) {
        
    });
    data.updateRating(loser.id, current2 - E, function(err, res){
        
    });
}

var express = require('express');
var http = require('http');
var sys = require('sys');
var formidable = require('formidable');
var fs = require('fs');
var rest = require('restler');

var app = express.createServer();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
	app.use(express.logger());
	app.use(express.static(__dirname + '/static'));
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/ranking', function(req, httpResponse) {
    rest.get('http://localhost:5984/pictures/_design/pictures/_view/sorted?limit=10&descending=true').on('complete', function(data) {
        var obj = eval('(' + data + ')');
        httpResponse.render('ranking', {
            locals: {images : obj.rows}
        });
    });
});

app.post('/upload', function(req, httpResponse) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var filename = files.upload.name;
        data.createDoc(filename, function(err2, res) {
            var id = res.id;
            var rev = res.rev;
            fs.readFile(files.upload.path, 'binary', function(err3, data) {
                rest.put('http://localhost:5984/pictures/' + id + '/' + filename + '?rev=' + rev, {
                    data: data,
                    encoding: 'binary',
                    headers: {
                        'Content-Type': files.upload.type,
                        'Content-Length': files.upload.size
                    }
                }).on('success', function() {
                    httpResponse.redirect('/');
                });
            });
        });
        //create document
        //add attachment
    });
});

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
    data.get([win, lose], function(err, res) {
        console.log(res);
        elo(res[0], res[1]);
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
                httpResponse.contentType(filename);
                httpResponse.send(buf, 200);
            });
        });
    });
    
});

app.listen(4000);
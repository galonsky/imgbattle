function pairRandom(arr){
    var first = Math.floor(Math.random() * (arr.length));
    var second = -1;
    var ret = [];
    do {
        second = Math.floor(Math.random() * (arr.length));
    } while(first == second);
    ret.push('/files/'+ arr[first].value._id);
    ret.push('/files/'+ arr[second].value._id);
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
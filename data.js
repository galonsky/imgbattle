var cradle = require('cradle');

var db = new(cradle.Connection)().database('pictures');
db.create();

db.save('_design/pictures', {
    all: {
        map: function(doc) {
            if(doc.filename)
                emit(doc.filename, doc);
        }
    }
});

module.exports.all = function(callback) {
    db.view('pictures/all', callback);
};

module.exports.get = function(id, callback) {
    db.get(id, callback);
};

module.exports.updateWins = function(id, wins, callback) {
    db.merge(id, {wins : wins}, callback);
};

module.exports.updateLosses = function(id, losses, callback) {
    db.merge(id, {losses : losses}, callback);
}
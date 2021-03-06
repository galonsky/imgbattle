var cradle = require('cradle');

var db = new(cradle.Connection)().database('pictures');
db.create();

db.save('_design/pictures', {
    all: {
        map: function(doc) {
            if(doc.filename)
                emit(doc.filename, doc);
        }
    },
    sorted: {
        map: function(doc) {
            if(doc.filename)
                emit(doc.rating, doc);
        }
    }
});

module.exports.all = function(callback) {
    db.view('pictures/all', callback);
};

module.exports.get = function(id, callback) {
    db.get(id, callback);
};

module.exports.updateRating = function(id, rating, callback) {
    db.merge(id, {rating : rating}, callback);
};

module.exports.createDoc = function(filename, callback) {
    db.save({
        filename: filename,
        rating: 1500
    }, callback);
};

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
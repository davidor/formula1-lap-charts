var mongoose = require('mongoose');

var seasonSchema = mongoose.Schema({
    year: Number,
    rounds: [{round: Number, name: String}]
});

var Season = mongoose.model('Season', seasonSchema);

module.exports = {
    Season: Season
};
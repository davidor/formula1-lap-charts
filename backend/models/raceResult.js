var mongoose = require('mongoose');

var raceResultSchema = mongoose.Schema({
    season: Number,
    round: Number,
    lapCount: Number,
    laps: [{
        name: String,
        placing: [Number],
        pitstops: [Number],
        mechanical: [Number],
        disqualified: [Number]
    }],
    lapped: [Number],
    safety: [Number]
});

var RaceResult = mongoose.model('RaceResult', raceResultSchema);

module.exports = {
    RaceResult: RaceResult
};

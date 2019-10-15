const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true, "the name is already in use."],
        required: [true, "name is required"]
    },
    maxPlayers: {
        type: Number,
        required: [true, "max number of players required"]
    },
    pwd: {
        type: String,
        required: [true, "password required"]
    },
    players: [{
        type: Schema.Types.ObjectId
    }]

});

module.exports = mongoose.model("room", RoomSchema);
const playerModel = require("../models/player");
const roomModel = require("../models/room")

module.exports = { getPlayers, getPlayer, delPlayer, createPlayer, joinRoom }

function getPlayers(req, res) {
    return playerModel.find()
        .then(players => res.json(players))
        .catch(err => res.json(err))
}
function getPlayer(req, res) {
    return playerModel.findById(req.params.id)
        .then(player => res.json(player))
        .catch(err => res.json(err))
}
function getPlayersFromRoom(req, res) {
    return playerModel.find()
        .then(players => {
            players.filter((player) => {
                return player
            })
        })
        .catch(err => res.json(err))
}
function delPlayer(req, res) {
    return playerModel.findByIdAndDelete(req.params.id)
        .then(player => res.json(player))
        .catch(err => res.json(err));
}
function createPlayer(req, res) {
    return playerModel.create(req.body)
        .then(player => res.json(player))
        .catch(err => res.json(err));
}
async function joinRoom(req, res) {
    const player = await playerModel.findById({ _id: req.body.player._id });
    const room = await roomModel.findById({ _id: req.body.room._id });
    room.players.push(player._id)
    return newRoom = await room.save((result) => res.json(result));
}
const mongoose = require('mongoose');

const userSChema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    contacts: Array
})

const userModel = mongoose.model('user', userSChema);

module.exports = {
    userModel
}
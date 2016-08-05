var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


var UserSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    }

});


var User = module.exports = mongoose.model('User', UserSchema);

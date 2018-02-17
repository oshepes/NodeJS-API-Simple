/**
 * Question Schema
 * @author Oren Shepes <oshepes@gmail.com>
 * @since 2/13/18
 */

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    first_name: {type: String},
    last_name: {type: String},
    level: {type: Number, default: 1},
    status: {type: Number, default: 1},
    local            : {
        email        : {type: String, unique: true},
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    created: { type: Date, default: Date.now },
    token: {type: String}
}, {collection: "users"});

// methods
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require ('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //installation du package mongoose-unique-valisator requise

const userSchema = mongoose.Schema ({
    email: { type: String, required: true, unique: true}, // Unique pour que 2 utilisateurs ne puissent pas utiliser la même adresse
    password: { type : String, required: true}
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
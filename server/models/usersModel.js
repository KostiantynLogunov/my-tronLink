"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const bcrypt = require('bcryptjs');

const UserSchema = new Schema(
    {
       username: { type: String,  default: null },
       address: { type: String },
       addedAt: { type: Date, default: Date.now }
    },
    {
        versionKey: false,
        collection: "UsersCollection"
    }
);

UserSchema.statics.findUserByAddress= function (address, cb) {
    return this.findOne({address: new RegExp(address, 'i')}, cb)
};
//хешування token
/*UserSchema.pre('save', function (next) {
    if (this.isModified('token') || this.isNew()) this.token = bcrypt.hashSync(this.token, 12);
    next();
});*/

module.exports = mongoose.model('UsersModel', UserSchema);
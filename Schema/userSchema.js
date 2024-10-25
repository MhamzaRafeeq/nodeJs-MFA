const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = schema({
    username: {
        type: String,
        required: true,
    },
    email  : {
        type: String,
        required: true,
        unique: true
    },
    password  : {
        type: String,
        required: true,
        unique: false
    },
    isMfaActive: {
        type: Boolean,
        required: false,
        default: false
    },
    twoFactorSecret :{
        type: String
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('User', userSchema);
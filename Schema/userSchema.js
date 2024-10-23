const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        
    },
    email  : {
        type: String,
        required: true,
        unique: true
    },
    password  : {
        type: String,
        required: true,
        unique: true
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
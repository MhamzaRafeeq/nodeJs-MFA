const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = schema({
    userName: {
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
        unique: true
    }
})

module.exports = mongoose.model('User', userSchema);
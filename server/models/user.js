const mongoose = require('mongoose')

const User = mongoose.model('User', {
    email: {
        type: String,
        trim: true,
        required: true,
        minLength: 8
    }
})

module.exports = { User }

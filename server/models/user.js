const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        minLength: 8,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    tokens: [{
        access: { type: String, required: true },
        token: { type: String, required: true }
    }]
})

UserSchema.methods.toJSON = function () {
    const user = this
    var userObject = user.toObject()
    return _.pick(userObject, ['_id', 'email'])
}

UserSchema.methods.generateAuthToken = function () {
    const user = this
    const access = 'auth'
    const token =  jwt.sign({_id: user._id.toHexString(), access }, 'abc123').toString()

    user.tokens = user.tokens.concat([{ access, token }])

    return user.save().then(() => token)
}

const User = mongoose.model('User', UserSchema)

module.exports = { User }

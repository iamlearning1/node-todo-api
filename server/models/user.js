const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

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
    const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString()

    user.tokens = user.tokens.concat([{ access, token }])

    return user.save().then(() => token)
}

UserSchema.methods.removeToken = function (token) {
    const user = this

    return user.update({
        $pull: {
            tokens: { token }
        }
    })
}

UserSchema.statics.findByToken = function (token) {
    const User = this
    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        // return new Promise((resolve, reject) => {
        //     reject()
        // })
        return Promise.reject()
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

UserSchema.statics.findByCredentials = function (email, password) {
    const User = this

    return User.findOne({ email }).then(user => {
        if (!user) return Promise.reject()
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (error, result) => {
                if (result) {
                    resolve(user)
                } else {
                    reject()
                }
            })
        })
    })
}

UserSchema.pre('save', function (next) {
    const user = this
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (error, salt) => {
            bcrypt.hash(user.password, salt, (error, hash) => {
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }

})

const User = mongoose.model('User', UserSchema)

module.exports = { User }
